import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { requireAuth } from "../middleware/auth";
import { notFound, badRequest } from "../lib/errors";

const router = Router();

router.use(requireAuth);

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: { include: { category: true } } } } },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: { product: { include: { category: true } } } } },
    });
  }
  return cart;
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user!.sub);
    res.json({ cart });
  })
);

router.post(
  "/items",
  asyncHandler(async (req, res) => {
    const { productId, quantity } = z
      .object({ productId: z.string(), quantity: z.number().int().min(1).default(1) })
      .parse(req.body);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) throw notFound("Product not available");
    if (product.stock < quantity) throw badRequest("Not enough stock");

    const cart = await getOrCreateCart(req.user!.sub);

    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId, quantity },
    });

    const updated = await getOrCreateCart(req.user!.sub);
    res.json({ cart: updated });
  })
);

router.patch(
  "/items/:id",
  asyncHandler(async (req, res) => {
    const { quantity } = z.object({ quantity: z.number().int().min(0) }).parse(req.body);
    const item = await prisma.cartItem.findUnique({ where: { id: req.params.id }, include: { cart: true } });
    if (!item || item.cart.userId !== req.user!.sub) throw notFound("Item not found");
    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
    }
    const updated = await getOrCreateCart(req.user!.sub);
    res.json({ cart: updated });
  })
);

router.delete(
  "/items/:id",
  asyncHandler(async (req, res) => {
    const item = await prisma.cartItem.findUnique({ where: { id: req.params.id }, include: { cart: true } });
    if (!item || item.cart.userId !== req.user!.sub) throw notFound("Item not found");
    await prisma.cartItem.delete({ where: { id: item.id } });
    const updated = await getOrCreateCart(req.user!.sub);
    res.json({ cart: updated });
  })
);

router.delete(
  "/",
  asyncHandler(async (req, res) => {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.sub } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.json({ ok: true });
  })
);

router.post(
  "/merge",
  asyncHandler(async (req, res) => {
    const { items } = z
      .object({ items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1) })) })
      .parse(req.body);
    const cart = await getOrCreateCart(req.user!.sub);
    for (const i of items) {
      const product = await prisma.product.findUnique({ where: { id: i.productId } });
      if (!product || !product.isActive) continue;
      await prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId: i.productId } },
        update: { quantity: { increment: i.quantity } },
        create: { cartId: cart.id, productId: i.productId, quantity: i.quantity },
      });
    }
    const updated = await getOrCreateCart(req.user!.sub);
    res.json({ cart: updated });
  })
);

export default router;
