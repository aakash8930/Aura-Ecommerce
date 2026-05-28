import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { requireAdmin } from "../middleware/auth";
import { notFound } from "../lib/errors";

const router = Router();
router.use(requireAdmin);

// ─── Stats ──────────────────────────────────────────

router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [users, products, orders, revenueAgg, lowStock, recentOrders] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID" } }),
      prisma.product.findMany({
        where: { stock: { lte: 10 } },
        select: { id: true, name: true, slug: true, stock: true, lowStockAt: true },
        orderBy: { stock: "asc" },
        take: 10,
      }),
      prisma.order.findMany({
        include: { items: true, user: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    // Sales last 7 days
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);
    const dailyOrders = await prisma.order.findMany({
      where: { paymentStatus: "PAID", createdAt: { gte: since } },
      select: { totalAmount: true, createdAt: true },
    });
    const dayMap: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      dayMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const o of dailyOrders) {
      const k = o.createdAt.toISOString().slice(0, 10);
      if (dayMap[k] !== undefined) dayMap[k] += o.totalAmount;
    }
    const sales7d = Object.entries(dayMap).map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }));

    res.json({
      users,
      products,
      orders,
      revenue: Math.round((revenueAgg._sum.totalAmount ?? 0) * 100) / 100,
      lowStock,
      recentOrders,
      sales7d,
    });
  })
);

// ─── Products ───────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  comparePrice: z.number().positive().nullable().optional(),
  imageUrl: z.string().min(1),
  stock: z.number().int().min(0).default(100),
  badge: z.string().nullable().optional(),
  tags: z.string().default(""),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  categoryId: z.string(),
});

router.get(
  "/products",
  asyncHandler(async (_req, res) => {
    const items = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  })
);

router.post(
  "/products",
  asyncHandler(async (req, res) => {
    const data = productSchema.parse(req.body);
    const product = await prisma.product.create({ data });
    res.status(201).json({ product });
  })
);

router.patch(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const data = productSchema.partial().parse(req.body);
    const product = await prisma.product.update({ where: { id: req.params.id }, data });
    res.json({ product });
  })
);

router.delete(
  "/products/:id",
  asyncHandler(async (req, res) => {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

// ─── Categories ─────────────────────────────────────

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  imageUrl: z.string().optional(),
});

router.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const items = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    res.json({ items });
  })
);

router.post(
  "/categories",
  asyncHandler(async (req, res) => {
    const data = categorySchema.parse(req.body);
    const category = await prisma.category.create({ data });
    res.status(201).json({ category });
  })
);

router.patch(
  "/categories/:id",
  asyncHandler(async (req, res) => {
    const data = categorySchema.partial().parse(req.body);
    const category = await prisma.category.update({ where: { id: req.params.id }, data });
    res.json({ category });
  })
);

router.delete(
  "/categories/:id",
  asyncHandler(async (req, res) => {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

// ─── Orders ─────────────────────────────────────────

router.get(
  "/orders",
  asyncHandler(async (_req, res) => {
    const items = await prisma.order.findMany({
      include: { items: true, user: true, shippingAddress: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  })
);

router.get(
  "/orders/:id",
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true, user: true, shippingAddress: true, billingAddress: true, payments: true, coupon: true },
    });
    if (!order) throw notFound("Order not found");
    res.json({ order });
  })
);

router.patch(
  "/orders/:id",
  asyncHandler(async (req, res) => {
    const { status } = z
      .object({ status: z.enum(["PENDING", "PROCESSING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]) })
      .parse(req.body);
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
    res.json({ order });
  })
);

// ─── Coupons ────────────────────────────────────────

const couponSchema = z.object({
  code: z.string().min(1).transform((v) => v.toUpperCase()),
  description: z.string().nullable().optional(),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  minSubtotal: z.number().nonnegative().default(0),
  maxDiscount: z.number().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().default(true),
});

router.get(
  "/coupons",
  asyncHandler(async (_req, res) => {
    const items = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ items });
  })
);

router.post(
  "/coupons",
  asyncHandler(async (req, res) => {
    const data = couponSchema.parse(req.body);
    const coupon = await prisma.coupon.create({
      data: {
        ...data,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
    res.status(201).json({ coupon });
  })
);

router.patch(
  "/coupons/:id",
  asyncHandler(async (req, res) => {
    const data = couponSchema.partial().parse(req.body);
    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: {
        ...data,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
    res.json({ coupon });
  })
);

router.delete(
  "/coupons/:id",
  asyncHandler(async (req, res) => {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

// ─── Users ──────────────────────────────────────────

router.get(
  "/users",
  asyncHandler(async (_req, res) => {
    const items = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true, _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  })
);

router.patch(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const data = z.object({ role: z.enum(["USER", "ADMIN"]).optional(), name: z.string().optional() }).parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, email: true, name: true, role: true },
    });
    res.json({ user });
  })
);

export default router;
