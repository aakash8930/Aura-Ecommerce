import Image from 'next/image';
import Link from 'next/link';
import type { Product, Category } from '@prisma/client';
import AddToCartButton from './AddToCartButton';
import './ProductCard.css';

interface ProductCardProps {
  product: Product & { category?: Category };
}

function getBadgeClass(badge: string | null) {
  if (!badge) return '';
  const map: Record<string, string> = {
    NEW: 'badge-new',
    SALE: 'badge-sale',
    BESTSELLER: 'badge-bestseller',
    HOT: 'badge-hot',
  };
  return map[badge] || '';
}

function StarRating({ rating, count }: { rating: number; count?: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div className="stars">
      {[...Array(5)].map((_, i) => (
        <span key={i} style={{ opacity: i < full ? 1 : (i === full && hasHalf ? 0.6 : 0.2) }}>★</span>
      ))}
      {count !== undefined && <span className="stars-count">({count})</span>}
    </div>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  return (
    <div className="product-card glass animate-fade-in">
      <Link href={`/product/${product.id}`} className="product-image-wrapper">
        {product.badge && (
          <span className={`badge product-badge ${getBadgeClass(product.badge)}`}>{product.badge}</span>
        )}
        {discount && (
          <span className="discount-tag">-{discount}%</span>
        )}
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="product-image"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Link>
      <div className="product-info">
        <div className="product-header">
          <Link href={`/category/${product.category?.slug || ''}`} className="product-category-link">
            {product.category?.name || 'Uncategorized'}
          </Link>
          <StarRating rating={product.rating} count={product.reviewCount} />
        </div>
        <Link href={`/product/${product.id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <div className="product-pricing">
            <span className="product-price">${product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <span className="product-compare-price">${product.comparePrice.toFixed(2)}</span>
            )}
          </div>
          <AddToCartButton product={product} compact />
        </div>
      </div>
    </div>
  );
}
