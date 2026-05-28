import { Router, raw } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { stripe } from "../lib/stripe";
import { config } from "../config";
import { consumeOrder } from "./account";

const router = Router();

// Stripe needs the raw body for signature verification.
router.post(
  "/stripe",
  raw({ type: "application/json" }),
  asyncHandler(async (req, res) => {
    if (!stripe || !config.stripe.webhookSecret) return res.status(501).json({ error: "Stripe not configured" });

    const sig = req.headers["stripe-signature"] as string;
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as any;
      const orderId = intent.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "PROCESSING", paymentStatus: "PAID" },
        });
        await prisma.payment.updateMany({
          where: { providerRef: intent.id },
          data: { status: "SUCCEEDED", rawPayload: JSON.stringify(intent) },
        });
        await consumeOrder(orderId);
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as any;
      await prisma.payment.updateMany({
        where: { providerRef: intent.id },
        data: { status: "FAILED", rawPayload: JSON.stringify(intent) },
      });
    }

    res.json({ received: true });
  })
);

export default router;
