"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Products
export async function createProduct(data: {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  imageUrl: string;
  categoryId: string;
  badge?: string;
  stock?: number;
  tags?: string;
  isFeatured?: boolean;
}) {
  const product = await prisma.product.create({ data });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return product;
}

export async function updateProduct(id: string, data: {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  comparePrice?: number | null;
  imageUrl?: string;
  categoryId?: string;
  badge?: string | null;
  stock?: number;
  tags?: string;
  isFeatured?: boolean;
}) {
  const product = await prisma.product.update({ where: { id }, data });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return product;
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}

// Categories
export async function createCategory(data: { name: string; slug: string; description?: string; imageUrl?: string }) {
  const category = await prisma.category.create({ data });
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  return category;
}

export async function updateCategory(id: string, data: { name?: string; slug?: string; description?: string; imageUrl?: string }) {
  const category = await prisma.category.update({ where: { id }, data });
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  return category;
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
}
