"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "./Toaster";
import type { Product } from "@/lib/types";

function badgeClass(badge: string | null) {
  if (!badge) return "";
  return ({ NEW: "badge-new", SALE: "badge-sale", BESTSELLER: "badge-bestseller", HOT: "badge-hot" } as Record<string, string>)[badge] ?? "";
}

function Stars({ rating, count }: { rating: number; count?: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="stars">
      {[...Array(5)].map((_, i) => (
        <span key={i} style={{ opacity: i < full ? 1 : i === full && half ? 0.6 : 0.2 }}>★</span>
      ))}
      {count !== undefined && <span className="stars-count">({count})</span>}
    </span>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { has, toggle } = useWishlist();
  const { user } = useAuth();
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;
  const isWished = has(product.id);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    await addToCart(product, 1);
  };
  const handleWish = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast("Sign in to use the wishlist", "info");
      return;
    }
    try {
      await toggle(product.id);
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  return (
    <article className="product-card glass">
      <Link href={`/product/${product.slug}`} className="product-image-wrapper">
        {product.badge && <span className={`badge product-badge ${badgeClass(product.badge)}`}>{product.badge}</span>}
        {discount && <span className="discount-tag">−{discount}%</span>}
        <button
          className={`wish-btn ${isWished ? "wish-active" : ""}`}
          onClick={handleWish}
          aria-label="Toggle wishlist"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isWished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="product-image"
        />
      </Link>
      <div className="product-info">
        <div className="product-header">
          <Link href={`/category/${product.category?.slug ?? ""}`} className="product-category-link">
            {product.category?.name ?? "Uncategorized"}
          </Link>
          <Stars rating={product.rating} count={product.reviewCount} />
        </div>
        <Link href={`/product/${product.slug}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <div className="product-pricing">
            <span className="product-price">${product.price.toFixed(2)}</span>
            {product.comparePrice && <span className="product-compare-price">${product.comparePrice.toFixed(2)}</span>}
          </div>
          <button className="btn-primary card-cta" onClick={handleAdd}>
            + Cart
          </button>
        </div>
      </div>
      <style>{`
        .product-card { display: flex; flex-direction: column; border-radius: var(--radius-lg); overflow: hidden; transition: all var(--transition-slow); animation: fadeInUp 0.5s ease-out both; }
        .product-card:hover { transform: translateY(-4px); border-color: var(--border-hover); box-shadow: var(--hover-shadow); }
        .product-image-wrapper { position: relative; aspect-ratio: 4/3; background: var(--bg-tertiary); overflow: hidden; display: block; }
        .product-image { object-fit: cover; transition: transform var(--transition-slow); }
        .product-card:hover .product-image { transform: scale(1.05); }
        .product-badge { position: absolute; top: 0.85rem; left: 0.85rem; z-index: 2; }
        .discount-tag { position: absolute; top: 0.85rem; right: 0.85rem; z-index: 2; background: var(--danger); color: white; padding: 0.25rem 0.6rem; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 700; }
        .wish-btn { position: absolute; bottom: 0.85rem; right: 0.85rem; z-index: 2; width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; border-radius: var(--radius-full); background: rgba(10, 11, 15, 0.8); backdrop-filter: blur(8px); border: 1px solid var(--border-color); color: var(--text-secondary); }
        .wish-btn:hover { color: var(--danger); border-color: var(--danger); }
        .wish-btn.wish-active { color: var(--danger); border-color: var(--danger); background: var(--danger-bg); }
        .product-info { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
        .product-header { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
        .product-category-link { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent-color); font-weight: 600; }
        .product-name { font-size: 1.05rem; font-weight: 600; line-height: 1.3; color: var(--text-primary); }
        .product-card:hover .product-name { color: var(--accent-color); }
        .product-description { color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .product-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 0.5rem; }
        .product-pricing { display: flex; align-items: baseline; gap: 0.5rem; }
        .product-price { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); }
        .product-compare-price { font-size: 0.85rem; color: var(--text-muted); text-decoration: line-through; }
        .card-cta { padding: 0.5rem 1rem; font-size: 0.8rem; border-radius: var(--radius-sm); }
      `}</style>
    </article>
  );
}
