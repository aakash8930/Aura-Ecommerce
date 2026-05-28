"use client";

import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product, full }: { product: Product; full?: boolean }) {
  const { addToCart } = useCart();
  return (
    <button
      className="btn-primary"
      style={full ? { width: "100%", padding: "1rem", fontSize: "1.05rem" } : undefined}
      onClick={() => addToCart(product, 1)}
      disabled={product.stock <= 0}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {product.stock <= 0 ? "Sold out" : "Add to cart"}
    </button>
  );
}
