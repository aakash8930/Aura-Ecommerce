import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";
import ReviewsSection from "@/components/ReviewsSection";
import QuestionsSection from "@/components/QuestionsSection";
import { api } from "@/lib/api";
import type { Product, Review, ProductQuestion } from "@/lib/types";
import styles from "./product.module.css";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const productRes = await api
    .get<{ product: Product; related: Product[] }>(`/api/products/${slug}`)
    .catch(() => null);
  if (!productRes) notFound();

  const { product, related } = productRes;

  const [reviewsRes, questionsRes] = await Promise.all([
    api.get<{ reviews: Review[] }>(`/api/products/${slug}/reviews`).catch(() => ({ reviews: [] })),
    api.get<{ questions: ProductQuestion[] }>(`/api/products/${slug}/questions`).catch(() => ({ questions: [] })),
  ]);

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;
  const full = Math.floor(product.rating);
  const half = product.rating - full >= 0.5;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <nav className={styles.breadcrumbs}>
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/products">Products</Link>
        <span>/</span>
        <Link href={`/category/${product.category?.slug}`}>{product.category?.name}</Link>
        <span>/</span>
        <span className={styles.breadcrumbCurrent}>{product.name}</span>
      </nav>

      <div className={styles.productLayout}>
        <div className={`${styles.imageContainer} glass`}>
          {product.badge && <span className={`badge ${styles.detailBadge} badge-${product.badge.toLowerCase()}`}>{product.badge}</span>}
          <Image src={product.imageUrl} alt={product.name} fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, 50vw" />
        </div>

        <div className={styles.productDetails}>
          <Link href={`/category/${product.category?.slug}`} className={styles.categoryTag}>{product.category?.name}</Link>
          <h1 className={styles.productTitle}>{product.name}</h1>

          <div className={styles.ratingRow}>
            <div className="stars" style={{ fontSize: "1.1rem" }}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ opacity: i < full ? 1 : i === full && half ? 0.6 : 0.2 }}>★</span>
              ))}
            </div>
            <span className={styles.ratingText}>{product.rating} ({product.reviewCount} reviews)</span>
          </div>

          <div className={styles.priceSection}>
            <span className={styles.price}>${product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <>
                <span className={styles.comparePrice}>${product.comparePrice.toFixed(2)}</span>
                <span className={styles.discountBadge}>Save {discount}%</span>
              </>
            )}
          </div>

          <p className={styles.description}>{product.description}</p>

          <div className={styles.metaInfo}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Stock</span>
              <span className={product.stock > 50 ? styles.inStock : product.stock > 0 ? styles.lowStock : styles.outStock}>
                {product.stock > 50 ? "✓ In stock" : product.stock > 0 ? `Only ${product.stock} left` : "Sold out"}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Category</span>
              <span>{product.category?.name}</span>
            </div>
            {product.tags && (
              <div className={styles.tags}>
                {product.tags.split(",").map((t) => (
                  <span key={t} className={styles.tag}>{t.trim()}</span>
                ))}
              </div>
            )}
          </div>

          <AddToCartButton product={product} full />
        </div>
      </div>

      <ReviewsSection productId={product.id} initialReviews={reviewsRes.reviews} />
      <QuestionsSection productId={product.id} initialQuestions={questionsRes.questions} />

      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.sectionTitle}>You may also like</h2>
          <div className={styles.relatedGrid}>
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
