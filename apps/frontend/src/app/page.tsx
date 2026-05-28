import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import type { Product, Category } from "@/lib/types";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const ICONS: Record<string, string> = {
  "ui-kits": "🎨",
  "3d-assets": "🧊",
  "motion-graphics": "🎬",
  templates: "📄",
  "icons-illustrations": "✏️",
  "sound-effects": "🔊",
};

export default async function Home() {
  const [featured, trending, deals, categories] = await Promise.all([
    api.get<{ items: Product[] }>("/api/products/featured").catch(() => ({ items: [] })),
    api.get<{ items: Product[] }>("/api/products/trending").catch(() => ({ items: [] })),
    api.get<{ items: Product[] }>("/api/products/deals").catch(() => ({ items: [] })),
    api.get<{ items: Category[] }>("/api/categories").catch(() => ({ items: [] })),
  ]);

  const totalProducts = categories.items.reduce((s, c) => s + (c._count?.products ?? 0), 0);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroGlow2} />
        <div className="container">
          <div className={styles.heroBadge}>✨ {totalProducts}+ premium digital assets</div>
          <h1 className={styles.title}>Build with assets<br />that ship.</h1>
          <p className={styles.subtitle}>
            UI kits, 3D, motion, templates, icons, and audio — hand-picked, production-ready, and royalty-free.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/products" className="btn-primary">Explore store →</Link>
            <Link href="/categories" className="btn-secondary">Browse categories</Link>
          </div>
          <div className={styles.statsRow}>
            <div className={styles.stat}><span className={styles.statNum}>{totalProducts}+</span><span className={styles.statLabel}>Products</span></div>
            <div className={styles.stat}><span className={styles.statNum}>{categories.items.length}</span><span className={styles.statLabel}>Categories</span></div>
            <div className={styles.stat}><span className={styles.statNum}>4.8</span><span className={styles.statLabel}>Avg rating</span></div>
            <div className={styles.stat}><span className={styles.statNum}>2.5K+</span><span className={styles.statLabel}>Reviews</span></div>
          </div>
        </div>
      </section>

      <section className={styles.categoriesSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Shop by category</h2>
          <div className={styles.categoriesGrid}>
            {categories.items.map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`} className={`${styles.categoryCard} glass`}>
                <div className={styles.categoryIcon}>{ICONS[cat.slug] ?? "📦"}</div>
                <h3>{cat.name}</h3>
                <span className={styles.categoryCount}>{cat._count?.products ?? 0} products</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.featuredSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Featured</h2>
              <p className={styles.sectionSub}>Hand-picked by our team for exceptional quality</p>
            </div>
            <Link href="/products" className="btn-secondary">View all →</Link>
          </div>
          <div className={styles.productGrid}>
            {featured.items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {deals.items.length > 0 && (
        <section className={styles.dealsSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>🔥 Deals</h2>
                <p className={styles.sectionSub}>Limited-time pricing on premium assets</p>
              </div>
              <Link href="/products?sortBy=price-asc" className="btn-secondary">See all →</Link>
            </div>
            <div className={styles.productGrid}>
              {deals.items.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className={styles.trendingSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Trending now</h2>
              <p className={styles.sectionSub}>Most popular among our community</p>
            </div>
            <Link href="/products?sortBy=rating" className="btn-secondary">View all →</Link>
          </div>
          <div className={styles.productGrid}>
            {trending.items.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <section className={styles.ctaBanner}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className={styles.ctaBannerTitle}>Ready to build something amazing?</h2>
          <p className={styles.ctaBannerSub}>Browse our full catalog of premium digital assets</p>
          <Link href="/products" className="btn-primary" style={{ marginTop: "1.5rem" }}>Start shopping →</Link>
        </div>
      </section>
    </>
  );
}
