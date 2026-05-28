import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getFeaturedProducts, getTrendingProducts, getDealsProducts } from '@/actions/productActions';
import { getCategories } from '@/actions/categoryActions';
import styles from './page.module.css';

export default async function Home() {
  const [featured, trending, deals, categories] = await Promise.all([
    getFeaturedProducts(),
    getTrendingProducts(),
    getDealsProducts(),
    getCategories(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroGlow2} />
        <div className="container">
          <div className={styles.heroBadge}>✨ Over 500+ Premium Digital Assets</div>
          <h1 className={styles.title}>Elevate Your<br/>Digital Experience</h1>
          <p className={styles.subtitle}>
            Discover premium, curated digital assets — UI kits, 3D renders, motion graphics, and more — crafted for modern creators.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/products" className="btn-primary">
              Explore Store →
            </Link>
            <Link href="/categories" className="btn-secondary">
              Browse Categories
            </Link>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.stat}><span className={styles.statNum}>18+</span><span className={styles.statLabel}>Products</span></div>
            <div className={styles.stat}><span className={styles.statNum}>6</span><span className={styles.statLabel}>Categories</span></div>
            <div className={styles.stat}><span className={styles.statNum}>4.8</span><span className={styles.statLabel}>Avg Rating</span></div>
            <div className={styles.stat}><span className={styles.statNum}>2.5K+</span><span className={styles.statLabel}>Reviews</span></div>
          </div>
        </div>
      </section>

      {/* Categories Strip */}
      <section className={styles.categoriesSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <div className={styles.categoriesGrid}>
            {(categories as any[]).map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`} className={`${styles.categoryCard} glass`}>
                <div className={styles.categoryIcon}>
                  {cat.slug === 'ui-kits' && '🎨'}
                  {cat.slug === '3d-assets' && '🧊'}
                  {cat.slug === 'motion-graphics' && '🎬'}
                  {cat.slug === 'templates' && '📄'}
                  {cat.slug === 'icons-illustrations' && '✏️'}
                  {cat.slug === 'sound-effects' && '🔊'}
                </div>
                <h3>{cat.name}</h3>
                <span className={styles.categoryCount}>{cat._count?.products || 0} products</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.featuredSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Featured Assets</h2>
              <p className={styles.sectionSub}>Hand-picked by our team for exceptional quality</p>
            </div>
            <Link href="/products" className="btn-secondary">View All →</Link>
          </div>
          <div className={styles.productGrid}>
            {(featured as any[]).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Deals */}
      {deals.length > 0 && (
        <section className={styles.dealsSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>🔥 Hot Deals</h2>
                <p className={styles.sectionSub}>Limited time offers on premium assets</p>
              </div>
              <Link href="/products?sortBy=price-asc" className="btn-secondary">See All Deals →</Link>
            </div>
            <div className={styles.productGrid}>
              {(deals as any[]).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending */}
      <section className={styles.trendingSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Trending Now</h2>
              <p className={styles.sectionSub}>Most popular among our community</p>
            </div>
            <Link href="/products?sortBy=rating" className="btn-secondary">View All →</Link>
          </div>
          <div className={styles.productGrid}>
            {(trending as any[]).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaBanner}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className={styles.ctaBannerTitle}>Ready to build something amazing?</h2>
          <p className={styles.ctaBannerSub}>Browse our complete catalog of premium digital assets</p>
          <Link href="/products" className="btn-primary" style={{ marginTop: '1.5rem' }}>
            Start Shopping →
          </Link>
        </div>
      </section>
    </>
  );
}
