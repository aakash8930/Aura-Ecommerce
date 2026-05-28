import Link from "next/link";
import "./admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar glass">
        <div className="admin-logo">
          <span style={{ color: 'var(--accent-color)' }}>▲</span> AURA
        </div>
        <div className="admin-logo-sub">Admin Panel</div>
        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            Dashboard
          </Link>
          <Link href="/admin/products" className="admin-nav-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/></svg>
            Products
          </Link>
          <Link href="/admin/categories" className="admin-nav-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
            Categories
          </Link>
          <Link href="/admin/orders" className="admin-nav-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
            Orders
          </Link>
          <Link href="/" target="_blank" className="admin-nav-link store-link">
            View Store →
          </Link>
        </nav>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
