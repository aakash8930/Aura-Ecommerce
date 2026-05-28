import { useEffect, useState } from "react";
import { api } from "../lib/api";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENT" | "FIXED";
  value: number;
  minSubtotal: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
};

const empty: Partial<Coupon> = { code: "", type: "PERCENT", value: 10, minSubtotal: 0, isActive: true };

export default function CouponsPage() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [editing, setEditing] = useState<Partial<Coupon> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => api.get<{ items: Coupon[] }>("/api/admin/coupons").then(({ items }) => setItems(items));
  useEffect(() => { load().catch((e) => setError(e.message)); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      const payload = {
        code: editing.code,
        description: editing.description ?? null,
        type: editing.type,
        value: Number(editing.value),
        minSubtotal: Number(editing.minSubtotal ?? 0),
        maxDiscount: editing.maxDiscount ? Number(editing.maxDiscount) : null,
        usageLimit: editing.usageLimit ? Number(editing.usageLimit) : null,
        isActive: Boolean(editing.isActive),
        expiresAt: editing.expiresAt ? new Date(editing.expiresAt).toISOString() : null,
      };
      if (editing.id) await api.patch(`/api/admin/coupons/${editing.id}`, payload);
      else await api.post("/api/admin/coupons", payload);
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete coupon?")) return;
    await api.del(`/api/admin/coupons/${id}`);
    await load();
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Coupons</h1>
          <p className="page-sub">{items.length} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ ...empty })}>+ New coupon</button>
      </header>

      {error && <div className="banner" style={{ background: "rgba(239,68,68,0.1)", borderColor: "var(--danger)", color: "var(--danger)" }}>{error}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Used</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td><code style={{ background: "var(--accent-light)", color: "var(--accent)", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>{c.code}</code><div style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>{c.description}</div></td>
                <td>{c.type}</td>
                <td>{c.type === "PERCENT" ? `${c.value}%` : `$${c.value.toFixed(2)}`}</td>
                <td>{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                <td><span className={`pill ${c.isActive ? "pill-active" : "pill-inactive"}`}>{c.isActive ? "Active" : "Inactive"}</span></td>
                <td>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(c)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(c.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="empty">No coupons</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="modal">
            <h2>{editing.id ? "Edit coupon" : "New coupon"}</h2>
            <div className="form-grid">
              <div className="form-row">
                <div>
                  <label className="label">Code</label>
                  <input className="input" required style={{ textTransform: "uppercase" }} value={editing.code ?? ""} onChange={(e) => setEditing((s) => ({ ...s, code: e.target.value.toUpperCase() }))} />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select className="input" value={editing.type ?? "PERCENT"} onChange={(e) => setEditing((s) => ({ ...s, type: e.target.value as "PERCENT" | "FIXED" }))}>
                    <option value="PERCENT">Percent</option>
                    <option value="FIXED">Fixed amount</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div>
                  <label className="label">Value{editing.type === "PERCENT" ? " (%)" : " ($)"}</label>
                  <input className="input" type="number" step="0.01" required value={editing.value ?? ""} onChange={(e) => setEditing((s) => ({ ...s, value: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="label">Min subtotal ($)</label>
                  <input className="input" type="number" step="0.01" value={editing.minSubtotal ?? 0} onChange={(e) => setEditing((s) => ({ ...s, minSubtotal: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="form-row">
                <div>
                  <label className="label">Max discount ($)</label>
                  <input className="input" type="number" step="0.01" value={editing.maxDiscount ?? ""} onChange={(e) => setEditing((s) => ({ ...s, maxDiscount: e.target.value ? Number(e.target.value) : null }))} />
                </div>
                <div>
                  <label className="label">Usage limit</label>
                  <input className="input" type="number" value={editing.usageLimit ?? ""} onChange={(e) => setEditing((s) => ({ ...s, usageLimit: e.target.value ? Number(e.target.value) : null }))} />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <input className="input" value={editing.description ?? ""} onChange={(e) => setEditing((s) => ({ ...s, description: e.target.value }))} />
              </div>
              <div>
                <label className="label">Expires at</label>
                <input className="input" type="datetime-local" value={editing.expiresAt ? editing.expiresAt.slice(0, 16) : ""} onChange={(e) => setEditing((s) => ({ ...s, expiresAt: e.target.value || null }))} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}>
                <input type="checkbox" checked={editing.isActive ?? true} onChange={(e) => setEditing((s) => ({ ...s, isActive: e.target.checked }))} />
                Active
              </label>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: "1.25rem", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
