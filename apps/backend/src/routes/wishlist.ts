import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { requireAuth } from "../middleware/auth";
import { notFound, conflict } from "../lib/errors";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.sub },
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { productId } = z.object({ productId: z.string() }).parse(req.body);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw notFound("Product not found");
    try {
      await prisma.wishlistItem.create({ data: { userId: req.user!.sub, productId } });
    } catch {
      throw conflict("Already in wishlist");
    }
    res.status(201).json({ ok: true });
  })
);

router.delete(
  "/:productId",
  asyncHandler(async (req, res) => {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user!.sub, productId: req.params.productId },
    });
    res.json({ ok: true });
  })
);

export default router;
