"use server";

import { prisma } from "@/lib/prisma";

export async function getProducts(options?: {
  search?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: string;
  limit?: number;
}) {
  const where: any = {};

  if (options?.search) {
    where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
      { tags: { contains: options.search } },
    ];
  }

  if (options?.categorySlug) {
    where.category = { slug: options.categorySlug };
  }

  if (options?.minPrice !== undefined || options?.maxPrice !== undefined) {
    where.price = {};
    if (options?.minPrice !== undefined) where.price.gte = options.minPrice;
    if (options?.maxPrice !== undefined) where.price.lte = options.maxPrice;
  }

  if (options?.minRating) {
    where.rating = { gte: options.minRating };
  }

  let orderBy: any = { createdAt: "desc" };
  if (options?.sortBy === "price-asc") orderBy = { price: "asc" };
  if (options?.sortBy === "price-desc") orderBy = { price: "desc" };
  if (options?.sortBy === "rating") orderBy = { rating: "desc" };
  if (options?.sortBy === "name") orderBy = { name: "asc" };

  return prisma.product.findMany({
    where,
    include: { category: true },
    orderBy,
    take: options?.limit,
  });
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isFeatured: true },
    include: { category: true },
    orderBy: { rating: "desc" },
    take: 6,
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export async function getProductsByCategory(slug: string) {
  return prisma.product.findMany({
    where: { category: { slug } },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRelatedProducts(productId: string, categoryId: string) {
  return prisma.product.findMany({
    where: {
      categoryId,
      NOT: { id: productId },
    },
    include: { category: true },
    take: 4,
    orderBy: { rating: "desc" },
  });
}

export async function getTrendingProducts() {
  return prisma.product.findMany({
    include: { category: true },
    orderBy: { reviewCount: "desc" },
    take: 4,
  });
}

export async function getDealsProducts() {
  return prisma.product.findMany({
    where: { comparePrice: { not: null } },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });
}
