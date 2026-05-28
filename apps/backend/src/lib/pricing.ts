import { Coupon } from "@prisma/client";

export interface PriceBreakdown {
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

export function applyCoupon(subtotal: number, coupon: Coupon | null): number {
  if (!coupon || !coupon.isActive) return 0;
  if (coupon.startsAt && coupon.startsAt > new Date()) return 0;
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return 0;
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return 0;
  if (subtotal < coupon.minSubtotal) return 0;

  let discount = coupon.type === "PERCENT" ? (subtotal * coupon.value) / 100 : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  return round(Math.min(discount, subtotal));
}

export function computeTotals(subtotal: number, coupon: Coupon | null): PriceBreakdown {
  const discountAmount = applyCoupon(subtotal, coupon);
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const shippingAmount = subtotal >= 75 ? 0 : subtotal > 0 ? 7.99 : 0;
  const taxAmount = round(taxableBase * 0.07);
  const totalAmount = round(taxableBase + shippingAmount + taxAmount);
  return {
    subtotal: round(subtotal),
    discountAmount,
    shippingAmount: round(shippingAmount),
    taxAmount,
    totalAmount,
  };
}
