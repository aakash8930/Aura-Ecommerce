import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/actions/productActions';
import { getCategories } from '@/actions/categoryActions';
import Link from 'next/link';
import styles from './products.module.css';

export default async function ProductsPage({ searchParams }: { searchParams: { search?: string; category?: string; sortBy?: string; minPrice?: string; maxPrice?: string } }) {
  const params = await Promise.resolve(searchParams);
  const [products, categories] = await Promise.all([
    getProducts({
      search: params.search,
      categorySlug: params.category,
      sortBy: params.sortBy,
      minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
    }),
    getCategories(),
  ]);

  return (
    <div className="container">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {params.search ? `Results for "${params.search}"` : 'All Products'}
        </h1>
        <p className={styles.pageSubtitle}>
          {products.length} {products.length === 1 ? 'product' : 'products'} found
        </p>
      </div>

      <div className={styles.shopLayout}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          <div className={`${styles.filterSection} glass`}>
            <h3 className={styles.filterTitle}>Categories</h3>
            <div className={styles.filterLinks}>
              <Link href="/products" className={`${styles.filterLink} ${!params.category ? styles.active : ''}`}>
                All Categories
              </Link>
              {(categories as any[]).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}${params.sortBy ? `&sortBy=${params.sortBy}` : ''}`}
                  className={`${styles.filterLink} ${params.category === cat.slug ? styles.active : ''}`}
                >
                  {cat.name} <span className={styles.filterCount}>({cat._count?.products || 0})</span>
                </Link>
              ))}
            </div>
          </div>

          <div className={`${styles.filterSection} glass`}>
            <h3 className={styles.filterTitle}>Price Range</h3>
            <div className={styles.priceLinks}>
              <Link href={`/products?maxPrice=20${params.category ? `&category=${params.category}` : ''}`} className={styles.filterLink}>Under $20</Link>
              <Link href={`/products?minPrice=20&maxPrice=50${params.category ? `&category=${params.category}` : ''}`} className={styles.filterLink}>$20 – $50</Link>
              <Link href={`/products?minPrice=50${params.category ? `&category=${params.category}` : ''}`} className={styles.filterLink}>$50+</Link>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className={styles.mainContent}>
          <div className={styles.toolbar}>
            <form action="/products" method="get" className={styles.searchBar}>
              <input type="text" name="search" defaultValue={params.search} placeholder="Search products..." className="form-input" style={{ borderRadius: 'var(--radius-full)', paddingLeft: '1.25rem' }} />
            </form>
            <div className={styles.sortGroup}>
              <span className={styles.sortLabel}>Sort by:</span>
              <div className={styles.sortLinks}>
                <Link href={`/products?sortBy=newest${params.category ? `&category=${params.category}` : ''}${params.search ? `&search=${params.search}` : ''}`} className={`${styles.sortLink} ${!params.sortBy || params.sortBy === 'newest' ? styles.active : ''}`}>Newest</Link>
                <Link href={`/products?sortBy=price-asc${params.category ? `&category=${params.category}` : ''}${params.search ? `&search=${params.search}` : ''}`} className={`${styles.sortLink} ${params.sortBy === 'price-asc' ? styles.active : ''}`}>Price ↑</Link>
                <Link href={`/products?sortBy=price-desc${params.category ? `&category=${params.category}` : ''}${params.search ? `&search=${params.search}` : ''}`} className={`${styles.sortLink} ${params.sortBy === 'price-desc' ? styles.active : ''}`}>Price ↓</Link>
                <Link href={`/products?sortBy=rating${params.category ? `&category=${params.category}` : ''}${params.search ? `&search=${params.search}` : ''}`} className={`${styles.sortLink} ${params.sortBy === 'rating' ? styles.active : ''}`}>Top Rated</Link>
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
              <Link href="/products" className="btn-primary" style={{ marginTop: '1rem' }}>Clear Filters</Link>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {(products as any[]).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
