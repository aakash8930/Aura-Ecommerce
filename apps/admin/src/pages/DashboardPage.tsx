import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

type Stats = {
  users: number;
  products: number;
  orders: number;
  revenue: number;
  lowStock: { id: string; name: string; slug: string; stock: number; lowStockAt: number }[];
  recentOrders: { id: string; email: string; status: string; totalAmount: number; createdAt: string; items: { id: string }[] }[];
  sales7d: { date: string; amount: number }[];
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Stats>("/api/admin/stats").then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="banner" style={{ background: "rgba(239,68,68,0.1)", borderColor: "var(--danger)", color: "var(--danger)" }}>{error}</div>;
  if (!stats) return <div className="empty">Loading dashboard…</div>;

  const maxSale = Math.max(...stats.sales7d.map((d) => d.amount), 1);

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">An overview of your store activity</p>
        </div>
      </header>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">Revenue (paid)</div>
          <div className="stat-value">${stats.revenue.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Orders</div>
          <div className="stat-value">{stats.orders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Products</div>
          <div className="stat-value">{stats.products}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Customers</div>
          <div className="stat-value">{stats.users}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <section className="panel" style={{ padding: "1.25rem" }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700 }}>Sales — last 7 days</h2>
          <div className="spark">
            {stats.sales7d.map((d) => (
              <div key={d.date} className="spark-bar" title={`${d.date}: $${d.amount.toFixed(2)}`} style={{ height: `${(d.amount / maxSale) * 100 || 2}%` }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: "0.7rem", color: "var(--text-3)" }}>
            {stats.sales7d.map((d) => (
              <span key={d.date}>{d.date.slice(5)}</span>
            ))}
          </div>
        </section>

        <section className="panel" style={{ padding: "1.25rem" }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.85rem" }}>Low stock</h2>
          {stats.lowStock.length === 0 ? (
            <p style={{ color: "var(--text-2)", fontSize: "0.85rem" }}>All products are well stocked.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stats.lowStock.map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                  <span style={{ fontSize: "0.78rem", color: p.stock === 0 ? "var(--danger)" : "var(--warning)", fontWeight: 600 }}>
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="panel" style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700 }}>Recent orders</h2>
          <Link to="/orders" className="btn btn-ghost btn-sm">View all →</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Items</th>
                <th style={{ textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link to={`/orders/${o.id}`}>#{o.id.slice(-8).toUpperCase()}</Link>
                  </td>
                  <td>{o.email}</td>
                  <td><span className={`pill pill-${o.status.toLowerCase()}`}>{o.status}</span></td>
                  <td>{o.items.length}</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>${o.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr><td colSpan={5} className="empty">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
