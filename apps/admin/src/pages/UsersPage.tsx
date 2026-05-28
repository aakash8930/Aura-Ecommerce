import { useEffect, useState } from "react";
import { api } from "../lib/api";

type User = { id: string; email: string; name: string | null; role: "USER" | "ADMIN"; createdAt: string; _count?: { orders: number } };

export default function UsersPage() {
  const [items, setItems] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = () => api.get<{ items: User[] }>("/api/admin/users").then(({ items }) => setItems(items));
  useEffect(() => { load().catch((e) => setError(e.message)); }, []);

  const setRole = async (id: string, role: "USER" | "ADMIN") => {
    try {
      await api.patch(`/api/admin/users/${id}`, { role });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-sub">{items.length} total</p>
        </div>
      </header>

      {error && <div className="banner" style={{ background: "rgba(239,68,68,0.1)", borderColor: "var(--danger)", color: "var(--danger)" }}>{error}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Orders</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td><div style={{ fontWeight: 600 }}>{u.name ?? "—"}</div></td>
                <td>{u.email}</td>
                <td><span className={`pill pill-${u.role.toLowerCase()}`}>{u.role}</span></td>
                <td>{u._count?.orders ?? 0}</td>
                <td style={{ color: "var(--text-2)" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setRole(u.id, u.role === "ADMIN" ? "USER" : "ADMIN")}
                  >
                    Make {u.role === "ADMIN" ? "user" : "admin"}
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="empty">No users</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
