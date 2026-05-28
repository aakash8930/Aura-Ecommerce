import { getProductsByCategory } from "@/actions/productActions";
import { getCategoryBySlug } from "@/actions/categoryActions";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const category = await getCategoryBySlug(resolvedParams.slug);
  if (!category) notFound();

  const products = await getProductsByCategory(resolvedParams.slug);

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <div style={{ padding: '3rem 0 2rem', textAlign: 'center' }}>
        <nav style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/categories">Categories</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>{category.name}</span>
        </nav>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{category.name}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          {category.description || `Browse our collection of ${category.name}.`}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{products.length} products</p>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No products in this category yet.</p>
          <Link href="/products" className="btn-primary" style={{ marginTop: '1rem' }}>Browse All Products</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.75rem' }}>
          {(products as any[]).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
