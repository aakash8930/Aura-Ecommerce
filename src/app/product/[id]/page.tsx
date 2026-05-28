import { getProductById, getRelatedProducts } from "@/actions/productActions";
import { getReviewsByProduct } from "@/actions/reviewActions";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";
import styles from "./product.module.css";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const product = await getProductById(resolvedParams.id);
  if (!product) notFound();

  const [reviews, related] = await Promise.all([
    getReviewsByProduct(product.id),
    getRelatedProducts(product.id, product.categoryId),
  ]);

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  const full = Math.floor(product.rating);
  const hasHalf = product.rating - full >= 0.5;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Breadcrumbs */}
      <nav className={styles.breadcrumbs}>
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/products">Products</Link>
        <span>/</span>
        <Link href={`/category/${product.category?.slug}`}>{product.category?.name}</Link>
        <span>/</span>
        <span className={styles.breadcrumbCurrent}>{product.name}</span>
      </nav>

      {/* Product Section */}
      <div className={styles.productLayout}>
        <div className={`${styles.imageContainer} glass`}>
          {product.badge && (
            <span className={`badge ${styles.detailBadge} badge-${product.badge.toLowerCase()}`}>{product.badge}</span>
          )}
          <Image src={product.imageUrl} alt={product.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 50vw" />
        </div>

        <div className={styles.productDetails}>
          <Link href={`/category/${product.category?.slug}`} className={styles.categoryTag}>
            {product.category?.name}
          </Link>
          <h1 className={styles.productTitle}>{product.name}</h1>

          <div className={styles.ratingRow}>
            <div className="stars" style={{ fontSize: '1.1rem' }}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ opacity: i < full ? 1 : (i === full && hasHalf ? 0.6 : 0.2) }}>★</span>
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
              <span className={product.stock > 50 ? styles.inStock : styles.lowStock}>
                {product.stock > 50 ? '✓ In Stock' : `Only ${product.stock} left`}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Category</span>
              <span>{product.category?.name}</span>
            </div>
            {product.tags && (
              <div className={styles.tags}>
                {product.tags.split(',').map(tag => (
                  <span key={tag} className={styles.tag}>{tag.trim()}</span>
                ))}
              </div>
            )}
          </div>

          <AddToCartButton product={product} />
        </div>
      </div>

      {/* Reviews */}
      <section className={styles.reviewsSection}>
        <h2 className={styles.sectionTitle}>Customer Reviews ({product.reviewCount})</h2>
        {reviews.length > 0 ? (
          <div className={styles.reviewsList}>
            {(reviews as any[]).map((review) => (
              <div key={review.id} className={`${styles.reviewCard} glass`}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewAvatar}>{review.userName.charAt(0)}</div>
                  <div>
                    <strong>{review.userName}</strong>
                    <div className="stars" style={{ fontSize: '0.85rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ opacity: i < review.rating ? 1 : 0.2 }}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className={styles.reviewComment}>{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>No reviews yet. Be the first to review!</p>
        )}
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.sectionTitle}>You May Also Like</h2>
          <div className={styles.relatedGrid}>
            {(related as any[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
