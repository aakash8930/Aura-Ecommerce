# Aura E-Commerce

A full-stack e-commerce platform built as a **portfolio project** to demonstrate end-to-end product engineering: authentication, payments, admin tooling, monorepo architecture, and a polished, redesigned UI/UX. Three independent apps share a single SQLite database through Prisma:

```
apps/
  backend    Express API · JWT auth · Google OAuth · Stripe (test mode) · webhooks
  frontend   Next.js 16 storefront (App Router, Turbopack, RSC)
  admin      Vite + React SPA admin panel
packages/
  db         Prisma schema, migrations, seed
```

**Highlights for reviewers:** monorepo with workspaces · custom JWT with refresh-token rotation · Google OAuth · server-rendered storefront talking to a separate API · isolated admin SPA · seedable demo data · zero-config local setup.

## Features

**Customer-facing**
- Catalog with search, category browsing, price/badge filters, sorting, pagination
- Product detail with images, ratings, verified-purchase reviews, Q&A
- Cart (guest cart in localStorage, merges into user cart on sign-in)
- Wishlist
- Checkout — addresses, coupons, tax, shipping, Stripe (test) or mock-pay
- Account: profile, password change, orders, addresses, wishlist
- Auth: email/password (JWT + refresh tokens with rotation), Google OAuth

**Admin (`apps/admin`, separate SPA)**
- Dashboard with revenue, 7-day sales sparkline, low-stock list, recent orders
- Product CRUD with badges, stock, featured, active flags, multi-category
- Category CRUD
- Order management — filter by status, view detail, update status
- Coupon CRUD (PERCENT or FIXED, min subtotal, max discount, usage cap, expiry)
- User management — promote / demote admin

## Quick start

```bash
# 1) install everything (workspace install)
npm install

# 2) generate Prisma client, run migrations, seed data
npm run setup
```

Then in three terminals (or `npm run dev` for all three concurrently):

```bash
npm run dev:backend      # http://localhost:4000
npm run dev:frontend     # http://localhost:3000
npm run dev:admin        # http://localhost:5173
```

`npm run dev` runs all three in parallel via concurrently.

## Seeded credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aura.com | admin1234 |
| Customer | demo@aura.com | user1234 |

Seeded coupons: `WELCOME10` (10% off, max $25), `SAVE20` ($20 off $100+), `BLACKFRIDAY` (25% off, max $100, 1000 uses).

## Configuration

A single `.env` at the repo root powers all apps. Copy and edit if needed — defaults work out of the box (Stripe and Google OAuth disabled means checkout uses mock-pay and the Google button returns 501).

```env
DATABASE_URL="file:./packages/db/prisma/dev.db"

# JWT
JWT_ACCESS_SECRET=dev-access-secret-change-me
JWT_REFRESH_SECRET=dev-refresh-secret-change-me

# Google OAuth — fill in to enable the "Continue with Google" button
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback

# Stripe — fill in for real card payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

NEXT_PUBLIC_API_URL=http://localhost:4000
VITE_API_URL=http://localhost:4000
```

### Enabling Google OAuth

1. Create OAuth credentials at https://console.cloud.google.com/apis/credentials
2. Authorized redirect URI: `http://localhost:4000/api/auth/google/callback`
3. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`

### Enabling Stripe (test mode)

1. `STRIPE_SECRET_KEY=sk_test_…` from https://dashboard.stripe.com/test/apikeys
2. To receive webhooks locally, run `stripe listen --forward-to localhost:4000/api/webhooks/stripe`
3. Use the printed signing secret for `STRIPE_WEBHOOK_SECRET`
4. Test card: `4242 4242 4242 4242` · any future expiry · any CVC

When Stripe is **not** configured, checkout uses the mock-pay path: orders are marked `PAID` immediately so you can exercise the full demo flow with no setup.

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run setup` | install + generate + migrate + seed |
| `npm run dev` | run backend, frontend, admin concurrently |
| `npm run dev:backend` | backend only |
| `npm run dev:frontend` | storefront only |
| `npm run dev:admin` | admin panel only |
| `npm run db:generate` | regenerate Prisma client |
| `npm run db:migrate` | run pending migrations |
| `npm run db:seed` | re-seed from `packages/db/prisma/seed.ts` |
| `npm run db:reset` | nuke and re-create the DB (uses `prisma migrate reset`) |
| `npm run build` | build all three apps for production |

## Architecture notes

- **Single source of truth for DB:** `packages/db` owns the Prisma schema and migrations; backend and seed scripts both connect to it. `DATABASE_URL` is a relative path from repo root and resolved to absolute at backend boot, so apps can be launched from any cwd.
- **Auth model:** access tokens are short-lived (15m) and stored in localStorage; refresh tokens are 30-day, hashed at rest in the DB, and rotated on every refresh.
- **Storefront cart:** guest cart lives in localStorage; on sign-in it's merged server-side into the user's persistent cart and the local copy is cleared.
- **Server actions removed:** the previous Next.js implementation used server actions hitting Prisma directly. The frontend now talks to the backend over fetch — both from RSC (`api.get` on the server) and Client Components (with the user's bearer token).
- **Admin is fully separate:** different port, different bundler, its own login. Storefront cannot reach `/api/admin/*` even if a user has the admin role — the admin panel SPA is the only consumer.

## Deployment

Three realistic options, depending on how much of a public demo you want.

### Option 1 — Free managed hosting (best for a portfolio link)

Each app runs on a different free tier; you'll need to swap SQLite for Postgres because the free tiers have ephemeral filesystems.

| App | Recommended free host | Notes |
|-----|----------------------|-------|
| `apps/frontend` (Next.js) | **Vercel** (free Hobby tier) | First-class Next.js host. Set `NEXT_PUBLIC_API_URL` to the backend URL. |
| `apps/admin` (Vite SPA) | **Vercel** / **Netlify** / **Cloudflare Pages** | Static-only, fits any static host. Set `VITE_API_URL`. |
| `apps/backend` (Express) | **Render** / **Railway** / **Fly.io** | Free tiers for small Node services. Render's free web service sleeps after 15 min idle. |
| Database | **Neon** / **Supabase** / **Railway Postgres** | All have free Postgres. Switch `provider = "sqlite"` → `"postgresql"` in `prisma/schema.prisma` and re-run `prisma migrate dev`. |

Migration steps when you go this route:

1. Create the Postgres DB on Neon/Supabase, copy the connection string.
2. In `packages/db/prisma/schema.prisma` change `provider = "sqlite"` to `"postgresql"`. SQLite-only quirks to remove: nothing in the current schema needs changing.
3. `DATABASE_URL=<postgres-url> npm run db:migrate -- --name init && npm run db:seed`
4. Deploy the three apps, set env vars, point `NEXT_PUBLIC_API_URL` / `VITE_API_URL` at the deployed backend URL, set `APP_URL` / `ADMIN_URL` on the backend so CORS lets them in.

### Option 2 — Self-host on your Ubuntu machine (yes, you can access it from anywhere)

You have Ubuntu already, so you can absolutely run this locally and expose it to the internet without buying anything. The cleanest free path:

```bash
# 1. Run the apps as background services with PM2
sudo npm install -g pm2
cd ~/New
npm run setup           # one-time

# Start each app under PM2 so it auto-restarts and survives reboot
pm2 start "npm run dev:backend"  --name aura-backend
pm2 start "npm run dev:frontend" --name aura-frontend
pm2 start "npm run dev:admin"    --name aura-admin
pm2 save
pm2 startup             # follow the printed command to enable boot-time start
```

Now you have three local services on `:3000`, `:4000`, `:5173`. To make them reachable from anywhere on the public internet **without** opening ports on your router or paying for a static IP, use a tunnel:

**Cloudflare Tunnel (recommended — free, persistent URL, works behind NAT):**

```bash
# Install
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# Authenticate (opens browser, link to your Cloudflare account)
cloudflared tunnel login

# Create a named tunnel and route subdomains
cloudflared tunnel create aura
cloudflared tunnel route dns aura aura.<your-domain>.com
cloudflared tunnel route dns aura api.<your-domain>.com
cloudflared tunnel route dns aura admin.<your-domain>.com
```

Create `~/.cloudflared/config.yml`:

```yaml
tunnel: aura
credentials-file: /home/aakash/.cloudflared/<tunnel-id>.json
ingress:
  - hostname: aura.example.com
    service: http://localhost:3000
  - hostname: api.example.com
    service: http://localhost:4000
  - hostname: admin.example.com
    service: http://localhost:5173
  - service: http_status:404
```

Then `cloudflared tunnel run aura` (or install as a systemd service: `sudo cloudflared service install`). Your laptop now serves `aura.example.com` to the world over HTTPS, no port forwarding required.

If you don't own a domain, the simpler alternative is **`ngrok`** (free tier gives a random `*.ngrok-free.app` URL each session) or **`tailscale funnel`** (free, gives a stable `*.ts.net` URL).

For production you should also:
- run `npm run build` and use `next start` / `vite preview` instead of dev servers
- set `NODE_ENV=production`, replace JWT secrets, set real `APP_URL` / `ADMIN_URL`
- update `NEXT_PUBLIC_API_URL` and `VITE_API_URL` to the public backend URL before building

### Option 3 — Single VPS (cheapest paid option, ~$5/mo)

If the free-tier sleep delays bother you, a $5/mo droplet on **DigitalOcean**, **Hetzner**, or an **Oracle Cloud Always-Free VM** runs all three apps comfortably with the same PM2 + Cloudflare Tunnel setup as Option 2 — just on a server you don't have to keep awake.

## What to highlight in your portfolio

When linking this on a CV / portfolio site:

- **Architecture:** "Monorepo with three independently deployable apps sharing a Prisma data package."
- **Auth:** "Custom JWT auth with refresh-token rotation + Google OAuth, hand-rolled rather than using NextAuth to demonstrate the underlying primitives."
- **Payments:** "Stripe (test mode) with webhook-driven order state, plus a graceful mock-pay fallback for environments without Stripe credentials."
- **Admin tooling:** "Separate Vite + React admin panel — dashboard with sales sparkline, full CRUD, role-gated."
- **Frontend:** "Next.js 16 with App Router, RSC for catalog pages, hybrid client cart that merges into a server cart on sign-in."

Two screenshots usually do the heavy lifting: the storefront home page (hero + product grid) and the admin dashboard (stats + sparkline + recent orders).
