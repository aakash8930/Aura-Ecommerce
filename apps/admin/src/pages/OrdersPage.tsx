import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

type Order = {
  id: string;
  email: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  items: { id: string }[];
  user?: { name: string | null } | null;
};

export default function OrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    api.get<{ items: Order[] }>("/api/admin/orders").then(({ items }) => setItems(items));
  }, []);

  const filtered = filter ? items.filter((o) => o.status === filter) : items;

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-sub">{items.length} total</p>
        </div>
        <select className="input" style={{ width: "auto" }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {["PENDING", "PROCESSING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </header>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Items</th>
              <th style={{ textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} style={{ cursor: "pointer" }} onClick={() => (window.location.href = `/orders/${o.id}`)}>
                <td><Link to={`/orders/${o.id}`}>#{o.id.slice(-8).toUpperCase()}</Link></td>
                <td>{o.user?.name ?? o.email}</td>
                <td style={{ color: "var(--text-2)" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td><span className={`pill pill-${o.status.toLowerCase()}`}>{o.status}</span></td>
                <td><span className={`pill pill-${o.paymentStatus === "PAID" ? "delivered" : "pending"}`}>{o.paymentStatus}</span></td>
                <td>{o.items.length}</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>${o.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="empty">No orders</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
