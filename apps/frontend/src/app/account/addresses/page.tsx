"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "@/components/Toaster";
import type { Address } from "@/lib/types";

const empty = { fullName: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "US", phone: "", isDefault: false };

export default function AddressesPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Address> | null>(null);

  const reload = () => {
    if (!accessToken) return;
    api
      .get<{ items: Address[] }>("/api/addresses", { token: accessToken })
      .then(({ items }) => setItems(items))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !editing) return;
    try {
      if (editing.id) {
        await api.patch(`/api/addresses/${editing.id}`, editing, { token: accessToken });
      } else {
        await api.post("/api/addresses", editing, { token: accessToken });
      }
      setEditing(null);
      reload();
      toast("Address saved", "success");
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  const remove = async (id: string) => {
    if (!accessToken || !confirm("Delete this address?")) return;
    await api.del(`/api/addresses/${id}`, { token: accessToken });
    reload();
  };

  if (loading) return <p style={{ color: "var(--text-secondary)" }}>Loading addresses…</p>;

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontWeight: 700 }}>Saved addresses ({items.length})</h2>
        {!editing && <button className="btn-primary" onClick={() => setEditing({ ...empty })}>+ Add address</button>}
      </div>

      {editing && (
        <form onSubmit={save} className="glass" style={{ padding: "1.5rem", borderRadius: 12, display: "grid", gap: "0.75rem" }}>
          <h3 style={{ fontWeight: 600 }}>{editing.id ? "Edit address" : "New address"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <input className="form-input" placeholder="Full name" required value={editing.fullName ?? ""} onChange={(e) => setEditing((s) => ({ ...s, fullName: e.target.value }))} />
            <input className="form-input" placeholder="Phone" value={editing.phone ?? ""} onChange={(e) => setEditing((s) => ({ ...s, phone: e.target.value }))} />
          </div>
          <input className="form-input" placeholder="Address line 1" required value={editing.line1 ?? ""} onChange={(e) => setEditing((s) => ({ ...s, line1: e.target.value }))} />
          <input className="form-input" placeholder="Address line 2 (optional)" value={editing.line2 ?? ""} onChange={(e) => setEditing((s) => ({ ...s, line2: e.target.value }))} />
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0.75rem" }}>
            <input className="form-input" placeholder="City" required value={editing.city ?? ""} onChange={(e) => setEditing((s) => ({ ...s, city: e.target.value }))} />
            <input className="form-input" placeholder="State" value={editing.state ?? ""} onChange={(e) => setEditing((s) => ({ ...s, state: e.target.value }))} />
            <input className="form-input" placeholder="Postal code" required value={editing.postalCode ?? ""} onChange={(e) => setEditing((s) => ({ ...s, postalCode: e.target.value }))} />
          </div>
          <input className="form-input" placeholder="Country" required value={editing.country ?? "US"} onChange={(e) => setEditing((s) => ({ ...s, country: e.target.value }))} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            <input type="checkbox" checked={Boolean(editing.isDefault)} onChange={(e) => setEditing((s) => ({ ...s, isDefault: e.target.checked }))} />
            Make default address
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" className="btn-primary">Save address</button>
            <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      {items.length === 0 && !editing && (
        <div className="glass" style={{ padding: "2rem", borderRadius: 12, color: "var(--text-secondary)", textAlign: "center" }}>
          No saved addresses. Add one for faster checkout.
        </div>
      )}

      {items.map((a) => (
        <article key={a.id} className="glass" style={{ padding: "1.25rem", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
          <div>
            <strong>
              {a.fullName}
              {a.isDefault && <span style={{ marginLeft: 8, fontSize: "0.7rem", color: "var(--accent-color)", background: "var(--accent-light)", padding: "0.15rem 0.5rem", borderRadius: 4 }}>default</span>}
            </strong>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: 4 }}>
              {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
              {a.city}{a.state ? `, ${a.state}` : ""} {a.postalCode}, {a.country}
            </p>
            {a.phone && <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{a.phone}</p>}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn-secondary" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }} onClick={() => setEditing(a)}>Edit</button>
            <button className="btn-danger" onClick={() => remove(a.id)}>Delete</button>
          </div>
        </article>
      ))}
    </div>
  );
}
