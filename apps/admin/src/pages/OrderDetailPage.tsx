import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";

type Order = {
  id: string;
  email: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  notes: string | null;
  items: { id: string; name: string; imageUrl: string; quantity: number; price: number; productId: string }[];
  shippingAddress: { fullName: string; line1: string; line2?: string | null; city: string; state?: string | null; postalCode: string; country: string; phone?: string | null } | null;
  user: { name: string | null; email: string } | null;
  payments: { id: string; provider: string; status: string; amount: number; providerRef?: string | null }[];
  coupon?: { code: string } | null;
};

const STATUSES = ["PENDING", "PROCESSING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] as const;

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => api.get<{ order: Order }>(`/api/admin/orders/${id}`).then(({ order }) => setOrder(order));

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [id]);

  const setStatus = async (status: string) => {
    try {
      await api.patch(`/api/admin/orders/${id}`, { status });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (error) return <div className="banner" style={{ background: "rgba(239,68,68,0.1)", borderColor: "var(--danger)", color: "var(--danger)" }}>{error}</div>;
  if (!order) return <div className="empty">Loading…</div>;

  return (
    <>
      <Link to="/orders" className="btn btn-ghost btn-sm" style={{ marginBottom: "1rem" }}>← Orders</Link>
      <header className="page-header">
        <div>
          <h1 className="page-title">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="page-sub">{new Date(order.createdAt).toLocaleString()} · {order.user?.name ?? order.email}</p>
        </div>
        <select className="input" style={{ width: "auto" }} value={order.status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
        <section className="panel" style={{ padding: "1.25rem" }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.85rem" }}>Items</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {order.items.map((it) => (
              <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 8, background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
                <img src={it.imageUrl} alt="" width={48} height={48} style={{ borderRadius: 6, objectFit: "cover", background: "var(--bg-3)" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{it.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>${it.price.toFixed(2)} · qty {it.quantity}</div>
                </div>
                <div style={{ fontWeight: 700 }}>${(it.price * it.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)", display: "grid", gap: 6, fontSize: "0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--text-2)" }}>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
            {order.discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-2)" }}>Discount {order.coupon ? `(${order.coupon.code})` : ""}</span>
                <span>−${order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--text-2)" }}>Shipping</span><span>${order.shippingAmount.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--text-2)" }}>Tax</span><span>${order.taxAmount.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1rem", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
              <span>Total</span><span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <aside style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <section className="panel" style={{ padding: "1.25rem" }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>Customer</h2>
            <p>{order.user?.name ?? "—"}</p>
            <p style={{ color: "var(--text-2)", fontSize: "0.85rem" }}>{order.email}</p>
          </section>

          {order.shippingAddress && (
            <section className="panel" style={{ padding: "1.25rem" }}>
              <h2 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>Shipping</h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.5 }}>
                <strong style={{ color: "var(--text)", display: "block" }}>{order.shippingAddress.fullName}</strong>
                {order.shippingAddress.line1}<br />
                {order.shippingAddress.line2 ? <>{order.shippingAddress.line2}<br /></> : null}
                {order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""} {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
                {order.shippingAddress.phone && <><br />{order.shippingAddress.phone}</>}
              </p>
            </section>
          )}

          <section className="panel" style={{ padding: "1.25rem" }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>Payment</h2>
            {order.payments.length === 0 ? (
              <p style={{ color: "var(--text-2)", fontSize: "0.85rem" }}>No payments yet</p>
            ) : (
              order.payments.map((p) => (
                <div key={p.id} style={{ fontSize: "0.85rem", padding: "8px 0", borderTop: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{p.provider}</span>
                    <span className={`pill pill-${p.status === "SUCCEEDED" ? "delivered" : "pending"}`}>{p.status}</span>
                  </div>
                  <div style={{ color: "var(--text-3)", fontSize: "0.78rem" }}>{p.providerRef}</div>
                </div>
              ))
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
