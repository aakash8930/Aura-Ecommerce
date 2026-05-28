import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { requireAuth } from "../middleware/auth";
import { notFound } from "../lib/errors";

const router = Router();
router.use(requireAuth);

const addressSchema = z.object({
  fullName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().default("US"),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await prisma.address.findMany({
      where: { userId: req.user!.sub },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    res.json({ items });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = addressSchema.parse(req.body);
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user!.sub }, data: { isDefault: false } });
    }
    const address = await prisma.address.create({ data: { ...data, userId: req.user!.sub } });
    res.status(201).json({ address });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = addressSchema.partial().parse(req.body);
    const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.user!.sub) throw notFound("Address not found");
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user!.sub }, data: { isDefault: false } });
    }
    const address = await prisma.address.update({ where: { id: req.params.id }, data });
    res.json({ address });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.user!.sub) throw notFound("Address not found");
    await prisma.address.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

export default router;
