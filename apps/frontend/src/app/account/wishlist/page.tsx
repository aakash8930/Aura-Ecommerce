"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

export default function WishlistPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    api
      .get<{ items: { product: Product }[] }>("/api/wishlist", { token: accessToken })
      .then(({ items }) => setItems(items.map((i) => i.product)))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) return <p style={{ color: "var(--text-secondary)" }}>Loading wishlist…</p>;
  if (items.length === 0)
    return (
      <div className="glass" style={{ padding: "3rem", borderRadius: 12, textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>Your wishlist is empty.</p>
        <Link href="/products" className="btn-primary">Find something you love</Link>
      </div>
    );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.25rem" }}>
      {items.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
