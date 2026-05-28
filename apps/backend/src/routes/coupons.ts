import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { badRequest } from "../lib/errors";
import { applyCoupon } from "../lib/pricing";

const router = Router();

router.post(
  "/validate",
  asyncHandler(async (req, res) => {
    const { code, subtotal } = z
      .object({ code: z.string().min(1), subtotal: z.number().nonnegative() })
      .parse(req.body);

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.isActive) throw badRequest("Invalid coupon");
    const discount = applyCoupon(subtotal, coupon);
    if (discount === 0) throw badRequest("Coupon not applicable");
    res.json({
      coupon: { code: coupon.code, type: coupon.type, value: coupon.value, description: coupon.description },
      discount,
    });
  })
);

export default router;
