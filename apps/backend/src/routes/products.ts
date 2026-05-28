import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { notFound } from "../lib/errors";

const router = Router();

const listQuery = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minRating: z.coerce.number().optional(),
  sort: z.enum(["new", "price-asc", "price-desc", "rating", "name"]).optional(),
  badge: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(24),
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = listQuery.parse(req.query);
    const where: any = { isActive: true };

    if (q.search) {
      where.OR = [
        { name: { contains: q.search } },
        { description: { contains: q.search } },
        { tags: { contains: q.search } },
      ];
    }
    if (q.category) where.category = { slug: q.category };
    if (q.minPrice !== undefined || q.maxPrice !== undefined) {
      where.price = {};
      if (q.minPrice !== undefined) where.price.gte = q.minPrice;
      if (q.maxPrice !== undefined) where.price.lte = q.maxPrice;
    }
    if (q.minRating) where.rating = { gte: q.minRating };
    if (q.badge) where.badge = q.badge;
    if (q.featured) where.isFeatured = true;

    let orderBy: any = { createdAt: "desc" };
    if (q.sort === "price-asc") orderBy = { price: "asc" };
    else if (q.sort === "price-desc") orderBy = { price: "desc" };
    else if (q.sort === "rating") orderBy = { rating: "desc" };
    else if (q.sort === "name") orderBy = { name: "asc" };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ items, total, page: q.page, limit: q.limit, pages: Math.ceil(total / q.limit) });
  })
);

router.get(
  "/featured",
  asyncHandler(async (_req, res) => {
    const items = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: true },
      orderBy: { rating: "desc" },
      take: 8,
    });
    res.json({ items });
  })
);

router.get(
  "/trending",
  asyncHandler(async (_req, res) => {
    const items = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { reviewCount: "desc" },
      take: 8,
    });
    res.json({ items });
  })
);

router.get(
  "/deals",
  asyncHandler(async (_req, res) => {
    const items = await prisma.product.findMany({
      where: { isActive: true, comparePrice: { not: null } },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
    res.json({ items });
  })
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const slug = req.params.slug;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true, images: { orderBy: { position: "asc" } } },
    });
    if (!product) throw notFound("Product not found");

    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, NOT: { id: product.id }, isActive: true },
      include: { category: true },
      take: 4,
      orderBy: { rating: "desc" },
    });

    res.json({ product, related });
  })
);

router.get(
  "/:slug/reviews",
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({ where: { slug: req.params.slug } });
    if (!product) throw notFound("Product not found");
    const reviews = await prisma.review.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ reviews });
  })
);

router.get(
  "/:slug/questions",
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({ where: { slug: req.params.slug } });
    if (!product) throw notFound("Product not found");
    const questions = await prisma.productQuestion.findMany({
      where: { productId: product.id },
      include: { answers: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ questions });
  })
);

export default router;
