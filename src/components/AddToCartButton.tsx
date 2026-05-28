"use client";

import { Product } from "@prisma/client";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product, compact }: { product: Product; compact?: boolean }) {
  const { addToCart } = useCart();

  if (compact) {
    return (
      <button
        className="btn-primary"
        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
        onClick={(e) => { e.preventDefault(); addToCart(product); }}
      >
        + Cart
      </button>
    );
  }

  return (
    <button
      className="btn-primary"
      style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
      onClick={() => addToCart(product)}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      Add to Cart
    </button>
  );
}
