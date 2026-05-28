import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import type { Product, Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catRes = await api.get<{ category: Category }>(`/api/categories/${slug}`).catch(() => null);
  if (!catRes) notFound();
  const { items: products } = await api
    .get<{ items: Product[] }>(`/api/products?category=${slug}&limit=60`)
    .catch(() => ({ items: [] }));

  return (
    <div className="container" style={{ paddingBottom: "4rem" }}>
      <div style={{ padding: "3rem 0 2rem", textAlign: "center" }}>
        <nav style={{ display: "flex", justifyContent: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/categories">Categories</Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>{catRes.category.name}</span>
        </nav>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>{catRes.category.name}</h1>
        <p style={{ color: "var(--text-secondary)" }}>{catRes.category.description}</p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>{products.length} products</p>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <p style={{ color: "var(--text-secondary)" }}>No products in this category yet.</p>
          <Link href="/products" className="btn-primary" style={{ marginTop: "1rem" }}>Browse all products</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
