"use server";

import { prisma } from "@/lib/prisma";

export async function createOrder(data: {
  email: string;
  items: { productId: string; quantity: number; price: number }[];
  totalAmount: number;
}) {
  return prisma.order.create({
    data: {
      email: data.email,
      totalAmount: data.totalAmount,
      status: "PENDING",
      items: { create: data.items },
    },
    include: { items: { include: { product: true } } },
  });
}

export async function getOrders() {
  return prisma.order.findMany({
    include: { items: { include: { product: true } }, user: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, user: true },
  });
}

export async function updateOrderStatus(id: string, status: string) {
  return prisma.order.update({
    where: { id },
    data: { status },
  });
}
