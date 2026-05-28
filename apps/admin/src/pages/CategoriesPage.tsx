import { useEffect, useState } from "react";
import { api } from "../lib/api";

type Category = { id: string; name: string; slug: string; description?: string | null; imageUrl?: string; _count?: { products: number } };

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => api.get<{ items: Category[] }>("/api/admin/categories").then(({ items }) => setItems(items));

  useEffect(() => { load().catch((e) => setError(e.message)); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      const payload = {
        name: editing.name,
        slug: editing.slug,
        description: editing.description ?? null,
        imageUrl: editing.imageUrl ?? "/images/category-default.png",
      };
      if (editing.id) await api.patch(`/api/admin/categories/${editing.id}`, payload);
      else await api.post("/api/admin/categories", payload);
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this category? Products in this category must be re-assigned first.")) return;
    try {
      await api.del(`/api/admin/categories/${id}`);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-sub">{items.length} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ slug: "", name: "" })}>+ New category</button>
      </header>

      {error && <div className="banner" style={{ background: "rgba(239,68,68,0.1)", borderColor: "var(--danger)", color: "var(--danger)" }}>{error}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Products</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td><div style={{ fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>{c.description}</div></td>
                <td><code style={{ background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 4, fontSize: "0.8rem" }}>{c.slug}</code></td>
                <td>{c._count?.products ?? 0}</td>
                <td>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(c)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(c.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={4} className="empty">No categories</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="modal">
            <h2>{editing.id ? "Edit category" : "New category"}</h2>
            <div className="form-grid">
              <div>
                <label className="label">Name</label>
                <input className="input" required value={editing.name ?? ""} onChange={(e) => setEditing((s) => ({ ...s, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Slug</label>
                <input className="input" required value={editing.slug ?? ""} onChange={(e) => setEditing((s) => ({ ...s, slug: e.target.value }))} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={2} value={editing.description ?? ""} onChange={(e) => setEditing((s) => ({ ...s, description: e.target.value }))} />
              </div>
              <div>
                <label className="label">Image URL</label>
                <input className="input" value={editing.imageUrl ?? ""} onChange={(e) => setEditing((s) => ({ ...s, imageUrl: e.target.value }))} />
              </div>
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
