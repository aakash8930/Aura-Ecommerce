import Stripe from "stripe";
import { config } from "../config";

export const stripe = config.stripe.enabled
  ? new Stripe(config.stripe.secretKey, { apiVersion: "2024-09-30.acacia" as any })
  : null;
