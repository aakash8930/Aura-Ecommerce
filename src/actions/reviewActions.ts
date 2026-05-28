"use server";

import { prisma } from "@/lib/prisma";

export async function getReviewsByProduct(productId: string) {
  return prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function createReview(data: {
  rating: number;
  comment: string;
  userName: string;
  productId: string;
}) {
  const review = await prisma.review.create({ data });

  // Update product rating
  const reviews = await prisma.review.findMany({ where: { productId: data.productId } });
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await prisma.product.update({
    where: { id: data.productId },
    data: { rating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length },
  });

  return review;
}
