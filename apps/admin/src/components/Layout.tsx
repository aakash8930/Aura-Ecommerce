import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/", label: "Dashboard", end: true, icon: "▦" },
  { to: "/products", label: "Products", icon: "▣" },
  { to: "/categories", label: "Categories", icon: "▤" },
  { to: "/orders", label: "Orders", icon: "▥" },
  { to: "/coupons", label: "Coupons", icon: "▨" },
  { to: "/users", label: "Users", icon: "▩" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-mark">▲</span> AURA
        </div>
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? "active" : "")}>
              <span style={{ width: 16, color: "var(--text-3)" }}>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="who">
          <div className="av">{(user?.name ?? user?.email ?? "A")[0].toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600 }}>{user?.name ?? "Admin"}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
          </div>
          <button className="btn-ghost" style={{ padding: 6, borderRadius: 6 }} onClick={() => logout()} title="Sign out">
            ⏻
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
