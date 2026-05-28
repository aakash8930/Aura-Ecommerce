import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { config } from "./config";
import { errorHandler } from "./middleware/error";
import { attachUser } from "./middleware/auth";

import auth from "./routes/auth";
import products from "./routes/products";
import categories from "./routes/categories";
import cart from "./routes/cart";
import wishlist from "./routes/wishlist";
import addresses from "./routes/addresses";
import account from "./routes/account";
import coupons from "./routes/coupons";
import admin from "./routes/admin";
import webhooks from "./routes/webhooks";

const app = express();

// Stripe webhook needs raw body — mount BEFORE express.json()
app.use("/api/webhooks", webhooks);

app.use(
  cors({
    origin: [config.appUrl, config.adminUrl],
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(config.isProd ? "combined" : "dev"));

// Auth limiter — protect login/register/refresh
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(attachUser);

app.get("/api/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.use("/api/auth", authLimiter, auth);
app.use("/api/products", products);
app.use("/api/categories", categories);
app.use("/api/cart", cart);
app.use("/api/wishlist", wishlist);
app.use("/api/addresses", addresses);
app.use("/api/account", account);
app.use("/api/coupons", coupons);
app.use("/api/admin", admin);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`▲ Aura backend listening on http://localhost:${config.port}`);
  console.log(`  google oauth: ${config.google.enabled ? "enabled" : "disabled (set GOOGLE_CLIENT_ID/SECRET)"}`);
  console.log(`  stripe: ${config.stripe.enabled ? "enabled" : "disabled (set STRIPE_SECRET_KEY) — checkout will mock-pay"}`);
});
