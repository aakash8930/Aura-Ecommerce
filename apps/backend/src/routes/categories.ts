import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { notFound } from "../lib/errors";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
    res.json({ items });
  })
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const cat = await prisma.category.findUnique({ where: { slug: req.params.slug } });
    if (!cat) throw notFound("Category not found");
    res.json({ category: cat });
  })
);

export default router;
