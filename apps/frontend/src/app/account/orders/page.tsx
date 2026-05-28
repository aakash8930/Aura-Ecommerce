"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";

export default function OrdersPage() {
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    api
      .get<{ items: Order[] }>("/api/account/orders", { token: accessToken })
      .then(({ items }) => setOrders(items))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) return <p style={{ color: "var(--text-secondary)" }}>Loading orders…</p>;
  if (orders.length === 0)
    return (
      <div className="glass" style={{ padding: "3rem", borderRadius: 12, textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>You haven't placed any orders yet.</p>
        <Link href="/products" className="btn-primary">Browse products</Link>
      </div>
    );

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {orders.map((o) => (
        <article key={o.id} className="glass" style={{ padding: "1.25rem", borderRadius: 12 }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <strong>Order #{o.id.slice(-8).toUpperCase()}</strong>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{new Date(o.createdAt).toLocaleString()}</p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span className={`status-badge status-${o.status.toLowerCase()}`}>{o.status}</span>
              <strong>${o.totalAmount.toFixed(2)}</strong>
            </div>
          </header>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {o.items.map((it) => (
              <div key={it.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--bg-glass-light)", padding: "0.4rem 0.6rem", borderRadius: 8 }}>
                <div style={{ position: "relative", width: 36, height: 36, borderRadius: 6, overflow: "hidden" }}>
                  <Image src={it.imageUrl} alt={it.name} fill style={{ objectFit: "cover" }} />
                </div>
                <span style={{ fontSize: "0.85rem" }}>
                  {it.name} <span style={{ color: "var(--text-muted)" }}>× {it.quantity}</span>
                </span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
