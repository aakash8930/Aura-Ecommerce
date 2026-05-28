import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import path from "path";
import { config } from "dotenv";

// Load root .env so DATABASE_URL is available when seeding from any workspace.
config({ path: path.resolve(__dirname, "../../../.env") });

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "UI Kits", slug: "ui-kits", description: "Production-ready UI components, design systems, and templates.", imageUrl: "/images/cat-ui.jpg" },
  { name: "3D Assets", slug: "3d-assets", description: "High-resolution 3D models, renders, and material packs.", imageUrl: "/images/cat-3d.jpg" },
  { name: "Motion Graphics", slug: "motion-graphics", description: "Animated assets, video templates, and visual effects.", imageUrl: "/images/cat-motion.jpg" },
  { name: "Templates", slug: "templates", description: "Notion, Figma, and presentation templates.", imageUrl: "/images/cat-templates.jpg" },
  { name: "Icons & Illustrations", slug: "icons-illustrations", description: "Curated icon sets and editable illustrations.", imageUrl: "/images/cat-icons.jpg" },
  { name: "Sound Effects", slug: "sound-effects", description: "Royalty-free SFX, loops, and ambient audio.", imageUrl: "/images/cat-sound.jpg" },
];

const PRODUCT_DATA: Array<{
  catSlug: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  imageUrl: string;
  badge?: string;
  tags: string;
  stock: number;
  isFeatured?: boolean;
  rating: number;
  reviewCount: number;
}> = [
  { catSlug: "ui-kits", name: "Nexus Dashboard UI Kit", slug: "nexus-dashboard-ui-kit", description: "Premium dark-mode admin dashboard kit with 50+ glassmorphic components, Figma + React + Tailwind exports, and a fully responsive layout system.", price: 49.99, comparePrice: 79.99, imageUrl: "/images/dashboard.png", badge: "BESTSELLER", tags: "dashboard,figma,react,tailwind,dark", stock: 200, isFeatured: true, rating: 4.8, reviewCount: 312 },
  { catSlug: "ui-kits", name: "Stride Mobile App Kit", slug: "stride-mobile-app-kit", description: "200+ mobile screens covering onboarding, auth, social, fintech, and travel — built for Figma and SwiftUI.", price: 39.0, imageUrl: "/images/mobile-kit.png", badge: "NEW", tags: "mobile,figma,swiftui,ios,android", stock: 150, isFeatured: true, rating: 4.7, reviewCount: 184 },
  { catSlug: "ui-kits", name: "Pulse SaaS Marketing Pack", slug: "pulse-saas-marketing-pack", description: "Hand-crafted landing, pricing, blog, and changelog sections for modern SaaS launches.", price: 29.0, comparePrice: 49.0, imageUrl: "/images/saas-pack.png", badge: "SALE", tags: "landing,saas,marketing,figma", stock: 250, rating: 4.6, reviewCount: 98 },
  { catSlug: "3d-assets", name: "Aura Creative 3D Bundle", slug: "aura-creative-3d-bundle", description: "Hand-rendered 3D abstract shapes, gradients, and product mockups — 4K transparent PNGs and Blender source files.", price: 39.0, imageUrl: "/images/bundle.png", badge: "HOT", tags: "3d,blender,render,abstract", stock: 120, isFeatured: true, rating: 4.9, reviewCount: 421 },
  { catSlug: "3d-assets", name: "Volumetric Cloud Pack", slug: "volumetric-cloud-pack", description: "Cinema-grade volumetric cloud renders for product pages and hero sections.", price: 24.0, imageUrl: "/images/clouds.png", tags: "3d,cloud,vfx", stock: 80, rating: 4.5, reviewCount: 67 },
  { catSlug: "motion-graphics", name: "Neon Flow Motion Pack", slug: "neon-flow-motion-pack", description: "4K neon trails, light leaks, and abstract motion loops perfect for streams and product reveals.", price: 59.99, comparePrice: 89.99, imageUrl: "/images/motion.png", badge: "SALE", tags: "motion,4k,after-effects,loop", stock: 60, isFeatured: true, rating: 4.8, reviewCount: 156 },
  { catSlug: "motion-graphics", name: "Liquid Logo Reveal Set", slug: "liquid-logo-reveal-set", description: "20 cinematic logo reveals with editable controls — After Effects + Premiere ready.", price: 34.0, imageUrl: "/images/logo-reveal.png", tags: "after-effects,logo,reveal", stock: 75, rating: 4.6, reviewCount: 88 },
  { catSlug: "templates", name: "Founders OS Notion Template", slug: "founders-os-notion", description: "An end-to-end Notion workspace for founders — fundraising CRM, OKRs, hiring, and product roadmap.", price: 19.0, imageUrl: "/images/notion.png", badge: "BESTSELLER", tags: "notion,template,startup", stock: 500, isFeatured: true, rating: 4.9, reviewCount: 612 },
  { catSlug: "templates", name: "Pitch Deck Master Pack", slug: "pitch-deck-master", description: "12 investor-ready pitch decks across SaaS, marketplaces, fintech, and consumer brands.", price: 29.0, comparePrice: 59.0, imageUrl: "/images/pitch.png", badge: "SALE", tags: "keynote,powerpoint,pitch", stock: 300, rating: 4.7, reviewCount: 145 },
  { catSlug: "icons-illustrations", name: "Lumen Icon Library", slug: "lumen-icon-library", description: "1,800 hand-crafted icons in line, duotone, and solid styles — SVG, PNG, and IconJar.", price: 18.0, imageUrl: "/images/icons.png", badge: "NEW", tags: "icons,svg,duotone", stock: 999, rating: 4.8, reviewCount: 274 },
  { catSlug: "icons-illustrations", name: "Memoji Illustration Pack", slug: "memoji-illustration-pack", description: "120 editable character illustrations — vector source + PNG renders.", price: 22.0, imageUrl: "/images/illustrations.png", tags: "illustration,characters,vector", stock: 220, rating: 4.5, reviewCount: 79 },
  { catSlug: "sound-effects", name: "Cinematic SFX Foundry", slug: "cinematic-sfx-foundry", description: "350 royalty-free cinematic SFX — risers, impacts, whooshes, and ambient drones.", price: 27.0, imageUrl: "/images/sfx.png", badge: "HOT", tags: "audio,sfx,cinematic", stock: 999, isFeatured: true, rating: 4.7, reviewCount: 132 },
];

const COUPONS = [
  { code: "WELCOME10", description: "10% off your first order", type: "PERCENT", value: 10, minSubtotal: 0, maxDiscount: 25 },
  { code: "SAVE20", description: "$20 off orders over $100", type: "FIXED", value: 20, minSubtotal: 100 },
  { code: "BLACKFRIDAY", description: "25% off everything", type: "PERCENT", value: 25, minSubtotal: 0, maxDiscount: 100, usageLimit: 1000 },
];

async function main() {
  console.log("→ Seeding…");

  // Users
  const adminPassword = await bcrypt.hash("admin1234", 10);
  const userPassword = await bcrypt.hash("user1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@aura.com" },
    update: { passwordHash: adminPassword, role: "ADMIN" },
    create: { email: "admin@aura.com", name: "Aura Admin", passwordHash: adminPassword, role: "ADMIN" },
  });
  const customer = await prisma.user.upsert({
    where: { email: "demo@aura.com" },
    update: { passwordHash: userPassword },
    create: { email: "demo@aura.com", name: "Demo Customer", passwordHash: userPassword, role: "USER" },
  });
  console.log(`  users: ${admin.email}, ${customer.email}`);

  // Categories
  for (const c of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }
  const categories = await prisma.category.findMany();
  const catId = (slug: string) => categories.find((c) => c.slug === slug)!.id;
  console.log(`  categories: ${categories.length}`);

  // Products
  for (const p of PRODUCT_DATA) {
    const { catSlug, ...data } = p;
    await prisma.product.upsert({
      where: { slug: data.slug },
      update: { ...data, categoryId: catId(catSlug) },
      create: { ...data, categoryId: catId(catSlug) },
    });
  }
  const products = await prisma.product.findMany();
  console.log(`  products: ${products.length}`);

  // Coupons
  for (const c of COUPONS) {
    await prisma.coupon.upsert({ where: { code: c.code }, update: c, create: c });
  }
  console.log(`  coupons: ${COUPONS.length}`);

  // Sample reviews on first product
  const first = products[0];
  if (first) {
    const existing = await prisma.review.count({ where: { productId: first.id } });
    if (existing === 0) {
      await prisma.review.createMany({
        data: [
          { productId: first.id, rating: 5, title: "Worth every penny", comment: "Saved my team weeks of design work. The component variants are top-notch.", userName: "Priya S.", verifiedPurchase: true },
          { productId: first.id, rating: 5, title: "Beautiful & well structured", comment: "Tokens, variants, and dark mode are all dialed in. Great DX.", userName: "Marcus T.", verifiedPurchase: true },
          { productId: first.id, rating: 4, title: "Solid kit", comment: "A few components needed tweaking for our brand, but easy to extend.", userName: "Lina B." },
        ],
      });
    }
  }

  console.log("✓ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
