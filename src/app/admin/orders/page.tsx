import { getOrders } from "@/actions/orderActions";
import { updateOrderStatus } from "@/actions/orderActions";
import { revalidatePath } from "next/cache";

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  async function handleStatusUpdate(formData: FormData) {
    "use server";
    const id = formData.get("orderId") as string;
    const status = formData.get("status") as string;
    await updateOrderStatus(id, status);
    revalidatePath("/admin/orders");
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Orders ({(orders as any[]).length})</h1>
      </div>

      <div className="admin-card glass">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(orders as any[]).map((order) => (
              <tr key={order.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{order.id.slice(0, 12)}...</td>
                <td>{order.email || order.user?.email || 'Guest'}</td>
                <td>{order.items?.length || 0} items</td>
                <td style={{ fontWeight: 600 }}>${order.totalAmount.toFixed(2)}</td>
                <td>
                  <span className={`status-badge status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <form action={handleStatusUpdate} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <select name="status" defaultValue={order.status} className="form-input" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', minWidth: '120px' }}>
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                    <button type="submit" className="btn-success" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Update</button>
                  </form>
                </td>
              </tr>
            ))}
            {(orders as any[]).length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
