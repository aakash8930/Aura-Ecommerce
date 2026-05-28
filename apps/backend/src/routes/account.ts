import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { requireAuth } from "../middleware/auth";
import { notFound, badRequest } from "../lib/errors";
import { computeTotals } from "../lib/pricing";
import { stripe } from "../lib/stripe";
import { config } from "../config";

const router = Router();

router.use(requireAuth);

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().min(1).max(2000),
});

router.post(
  "/reviews",
  asyncHandler(async (req, res) => {
    const data = reviewSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) throw notFound("User");

    const verified = await prisma.orderItem.findFirst({
      where: { productId: data.productId, order: { userId: user.id, paymentStatus: "PAID" } },
    });

    const review = await prisma.review.create({
      data: {
        ...data,
        userId: user.id,
        userName: user.name ?? user.email.split("@")[0],
        verifiedPurchase: Boolean(verified),
      },
    });
    await refreshProductRating(data.productId);
    res.status(201).json({ review });
  })
);

router.post(
  "/questions",
  asyncHandler(async (req, res) => {
    const data = z
      .object({ productId: z.string(), question: z.string().min(5).max(500) })
      .parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) throw notFound("User");
    const q = await prisma.productQuestion.create({
      data: {
        productId: data.productId,
        userId: user.id,
        userName: user.name ?? user.email.split("@")[0],
        question: data.question,
      },
    });
    res.status(201).json({ question: q });
  })
);

router.post(
  "/answers",
  asyncHandler(async (req, res) => {
    const data = z
      .object({ questionId: z.string(), answer: z.string().min(1).max(2000) })
      .parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) throw notFound("User");
    const a = await prisma.productAnswer.create({
      data: {
        questionId: data.questionId,
        userId: user.id,
        userName: user.name ?? user.email.split("@")[0],
        answer: data.answer,
        isStaff: user.role === "ADMIN",
      },
    });
    res.status(201).json({ answer: a });
  })
);

async function refreshProductRating(productId: string) {
  const reviews = await prisma.review.findMany({ where: { productId } });
  if (reviews.length === 0) {
    await prisma.product.update({ where: { id: productId }, data: { rating: 0, reviewCount: 0 } });
    return;
  }
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  await prisma.product.update({
    where: { id: productId },
    data: { rating: Math.round(avg * 10) / 10, reviewCount: reviews.length },
  });
}

// ── Orders & Checkout ─────────────────────────────────

const checkoutSchema = z.object({
  shippingAddressId: z.string().optional(),
  shippingAddress: z
    .object({
      fullName: z.string().min(1),
      line1: z.string().min(1),
      line2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().optional(),
      postalCode: z.string().min(1),
      country: z.string().default("US"),
      phone: z.string().optional(),
    })
    .optional(),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

router.get(
  "/orders",
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.sub },
      include: { items: true, shippingAddress: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items: orders });
  })
);

router.get(
  "/orders/:id",
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true, shippingAddress: true, billingAddress: true, payments: true, coupon: true },
    });
    if (!order || order.userId !== req.user!.sub) throw notFound("Order not found");
    res.json({ order });
  })
);

router.post(
  "/checkout",
  asyncHandler(async (req, res) => {
    const data = checkoutSchema.parse(req.body);
    const userId = req.user!.sub;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0) throw badRequest("Cart is empty");

    // stock guard
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw badRequest(`"${item.product.name}" has only ${item.product.stock} in stock`);
      }
    }

    let shippingAddressId = data.shippingAddressId ?? null;
    if (!shippingAddressId && data.shippingAddress) {
      const created = await prisma.address.create({
        data: { ...data.shippingAddress, userId },
      });
      shippingAddressId = created.id;
    }
    if (!shippingAddressId) throw badRequest("Shipping address required");

    let coupon = null;
    if (data.couponCode) {
      coupon = await prisma.coupon.findUnique({ where: { code: data.couponCode.toUpperCase() } });
    }

    const subtotal = cart.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const totals = computeTotals(subtotal, coupon);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const order = await prisma.order.create({
      data: {
        userId,
        email: user!.email,
        status: "PENDING",
        paymentStatus: "UNPAID",
        ...totals,
        couponId: coupon?.id,
        shippingAddressId,
        notes: data.notes,
        items: {
          create: cart.items.map((i) => ({
            productId: i.productId,
            name: i.product.name,
            imageUrl: i.product.imageUrl,
            quantity: i.quantity,
            price: i.product.price,
          })),
        },
      },
      include: { items: true, shippingAddress: true },
    });

    let clientSecret: string | null = null;

    if (config.stripe.enabled && stripe) {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(totals.totalAmount * 100),
        currency: "usd",
        metadata: { orderId: order.id, userId },
      });
      clientSecret = intent.client_secret;
      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: "stripe",
          providerRef: intent.id,
          amount: totals.totalAmount,
          status: "PENDING",
        },
      });
    } else {
      // Mock-pay path: mark order PAID immediately so the demo flow works without Stripe keys
      await prisma.payment.create({
        data: { orderId: order.id, provider: "manual", amount: totals.totalAmount, status: "SUCCEEDED" },
      });
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PROCESSING", paymentStatus: "PAID" },
      });
      // Decrement stock + clear cart + record coupon usage
      await consumeOrder(order.id);
    }

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(201).json({ order, clientSecret });
  })
);

export async function consumeOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return;
  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }
  if (order.couponId) {
    await prisma.coupon.update({ where: { id: order.couponId }, data: { usedCount: { increment: 1 } } });
  }
}

export default router;
