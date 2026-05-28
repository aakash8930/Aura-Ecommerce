import { prisma } from "@/lib/prisma";
import { getOrders } from "@/actions/orderActions";
import Link from "next/link";

export default async function AdminDashboard() {
  const [productCount, categoryCount, userCount, orderCount, revenue, orders] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    getOrders(),
  ]);

  const recentOrders = (orders as any[]).slice(0, 5);

  return (
    <div>
      <h1 className="admin-page-title" style={{ marginBottom: '2rem' }}>Dashboard</h1>

      <div className="stat-grid">
        <div className="stat-card glass">
          <span className="stat-card-label">Revenue</span>
          <span className="stat-card-value">${(revenue._sum.totalAmount || 0).toFixed(2)}</span>
          <span className="stat-card-sub">All time</span>
        </div>
        <div className="stat-card glass">
          <span className="stat-card-label">Orders</span>
          <span className="stat-card-value">{orderCount}</span>
          <span className="stat-card-sub">Total orders</span>
        </div>
        <div className="stat-card glass">
          <span className="stat-card-label">Products</span>
          <span className="stat-card-value">{productCount}</span>
          <span className="stat-card-sub">{categoryCount} categories</span>
        </div>
        <div className="stat-card glass">
          <span className="stat-card-label">Users</span>
          <span className="stat-card-value">{userCount}</span>
          <span className="stat-card-sub">Registered</span>
        </div>
      </div>

      <div className="recent-orders">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Recent Orders</h3>
          <Link href="/admin/orders" style={{ color: 'var(--accent-color)', fontSize: '0.85rem' }}>View All →</Link>
        </div>
        <div className="admin-card glass" style={{ marginTop: '1rem' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: any) => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{order.id.slice(0, 12)}...</td>
                  <td>{order.email || order.user?.email || '—'}</td>
                  <td>${order.totalAmount.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
