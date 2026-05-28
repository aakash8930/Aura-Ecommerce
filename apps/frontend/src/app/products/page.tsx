import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import type { Product, Category } from "@/lib/types";
import styles from "./products.module.css";

export const dynamic = "force-dynamic";

type SP = { search?: string; category?: string; sortBy?: string; minPrice?: string; maxPrice?: string; badge?: string; page?: string };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const query = new URLSearchParams();
  if (sp.search) query.set("search", sp.search);
  if (sp.category) query.set("category", sp.category);
  if (sp.minPrice) query.set("minPrice", sp.minPrice);
  if (sp.maxPrice) query.set("maxPrice", sp.maxPrice);
  if (sp.sortBy) query.set("sort", sp.sortBy);
  if (sp.badge) query.set("badge", sp.badge);
  if (sp.page) query.set("page", sp.page);
  query.set("limit", "24");

  const [productsRes, categoriesRes] = await Promise.all([
    api.get<{ items: Product[]; total: number; page: number; pages: number }>(`/api/products?${query}`).catch(() => ({ items: [], total: 0, page: 1, pages: 1 })),
    api.get<{ items: Category[] }>("/api/categories").catch(() => ({ items: [] })),
  ]);

  const buildHref = (overrides: Partial<SP>) => {
    const merged = { ...sp, ...overrides };
    const q = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => v && q.set(k, String(v)));
    return `/products${q.toString() ? `?${q}` : ""}`;
  };

  return (
    <div className="container">
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{sp.search ? `Results for "${sp.search}"` : sp.category ? categoriesRes.items.find((c) => c.slug === sp.category)?.name ?? "Products" : "All products"}</h1>
        <p className={styles.pageSubtitle}>
          {productsRes.total} {productsRes.total === 1 ? "product" : "products"}
        </p>
      </header>

      <div className={styles.shopLayout}>
        <aside className={styles.sidebar}>
          <div className={`${styles.filterSection} glass`}>
            <h3 className={styles.filterTitle}>Categories</h3>
            <div className={styles.filterLinks}>
              <Link href={buildHref({ category: undefined })} className={`${styles.filterLink} ${!sp.category ? styles.active : ""}`}>All categories</Link>
              {categoriesRes.items.map((cat) => (
                <Link key={cat.id} href={buildHref({ category: cat.slug })} className={`${styles.filterLink} ${sp.category === cat.slug ? styles.active : ""}`}>
                  {cat.name} <span className={styles.filterCount}>({cat._count?.products ?? 0})</span>
                </Link>
              ))}
            </div>
          </div>

          <div className={`${styles.filterSection} glass`}>
            <h3 className={styles.filterTitle}>Price</h3>
            <div className={styles.priceLinks}>
              <Link href={buildHref({ minPrice: undefined, maxPrice: "20" })} className={styles.filterLink}>Under $20</Link>
              <Link href={buildHref({ minPrice: "20", maxPrice: "50" })} className={styles.filterLink}>$20 – $50</Link>
              <Link href={buildHref({ minPrice: "50", maxPrice: undefined })} className={styles.filterLink}>$50+</Link>
              <Link href={buildHref({ minPrice: undefined, maxPrice: undefined })} className={styles.filterLink}>Any price</Link>
            </div>
          </div>

          <div className={`${styles.filterSection} glass`}>
            <h3 className={styles.filterTitle}>Promotions</h3>
            <div className={styles.priceLinks}>
              <Link href={buildHref({ badge: "SALE" })} className={`${styles.filterLink} ${sp.badge === "SALE" ? styles.active : ""}`}>On sale</Link>
              <Link href={buildHref({ badge: "NEW" })} className={`${styles.filterLink} ${sp.badge === "NEW" ? styles.active : ""}`}>New arrivals</Link>
              <Link href={buildHref({ badge: "BESTSELLER" })} className={`${styles.filterLink} ${sp.badge === "BESTSELLER" ? styles.active : ""}`}>Bestsellers</Link>
              <Link href={buildHref({ badge: undefined })} className={styles.filterLink}>All</Link>
            </div>
          </div>
        </aside>

        <div className={styles.mainContent}>
          <div className={styles.toolbar}>
            <form action="/products" method="get" className={styles.searchBar}>
              <input type="text" name="search" defaultValue={sp.search} placeholder="Search…" className="form-input" style={{ borderRadius: "var(--radius-full)", paddingLeft: "1.25rem" }} />
            </form>
            <div className={styles.sortGroup}>
              <span className={styles.sortLabel}>Sort:</span>
              <div className={styles.sortLinks}>
                {[["new", "Newest"], ["price-asc", "Price ↑"], ["price-desc", "Price ↓"], ["rating", "Top rated"]].map(([v, l]) => (
                  <Link key={v} href={buildHref({ sortBy: v })} className={`${styles.sortLink} ${sp.sortBy === v ? styles.active : ""}`}>{l}</Link>
                ))}
              </div>
            </div>
          </div>

          {productsRes.items.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No products match your filters</h3>
              <p>Try adjusting your search or filters</p>
              <Link href="/products" className="btn-primary" style={{ marginTop: "1rem" }}>Clear filters</Link>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {productsRes.items.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {productsRes.pages > 1 && (
            <nav className={styles.pagination}>
              {Array.from({ length: productsRes.pages }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={buildHref({ page: String(p) })} className={`${styles.pageLink} ${productsRes.page === p ? styles.active : ""}`}>
                  {p}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
