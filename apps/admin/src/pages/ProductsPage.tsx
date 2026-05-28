import { useEffect, useState } from "react";
import { api } from "../lib/api";

type Category = { id: string; name: string; slug: string; description?: string | null; imageUrl?: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  imageUrl: string;
  stock: number;
  badge: string | null;
  tags: string;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  category?: Category;
};

const empty: Partial<Product> = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  comparePrice: null,
  imageUrl: "/images/dashboard.png",
  stock: 100,
  badge: null,
  tags: "",
  isFeatured: false,
  isActive: true,
};

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const [{ items }, { items: cs }] = await Promise.all([
      api.get<{ items: Product[] }>("/api/admin/products"),
      api.get<{ items: Category[] }>("/api/admin/categories"),
    ]);
    setItems(items);
    setCats(cs);
  };

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      const payload = {
        name: editing.name,
        slug: editing.slug,
        description: editing.description,
        price: Number(editing.price),
        comparePrice: editing.comparePrice ? Number(editing.comparePrice) : null,
        imageUrl: editing.imageUrl,
        stock: Number(editing.stock),
        badge: editing.badge || null,
        tags: editing.tags ?? "",
        isFeatured: Boolean(editing.isFeatured),
        isActive: Boolean(editing.isActive),
        categoryId: editing.categoryId,
      };
      if (editing.id) await api.patch(`/api/admin/products/${editing.id}`, payload);
      else await api.post("/api/admin/products", payload);
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.del(`/api/admin/products/${id}`);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const filtered = items.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase()));

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-sub">{items.length} total · click a row to edit</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ ...empty, categoryId: cats[0]?.id })}>
          + New product
        </button>
      </header>

      {error && <div className="banner" style={{ background: "rgba(239,68,68,0.1)", borderColor: "var(--danger)", color: "var(--danger)" }}>{error}</div>}

      <input className="input" style={{ marginBottom: "1rem", maxWidth: 320 }} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={p.imageUrl} alt="" width={36} height={36} style={{ borderRadius: 6, objectFit: "cover", background: "var(--bg-3)" }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td>{p.category?.name ?? "—"}</td>
                <td>
                  ${p.price.toFixed(2)}
                  {p.comparePrice && <span style={{ marginLeft: 6, color: "var(--text-3)", textDecoration: "line-through", fontSize: "0.78rem" }}>${p.comparePrice.toFixed(2)}</span>}
                </td>
                <td style={{ color: p.stock <= 5 ? "var(--warning)" : undefined }}>{p.stock}</td>
                <td><span className={`pill ${p.isActive ? "pill-active" : "pill-inactive"}`}>{p.isActive ? "Active" : "Inactive"}</span></td>
                <td>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="empty">No products</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="modal">
            <h2>{editing.id ? "Edit product" : "New product"}</h2>
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
                <textarea className="input" rows={3} required value={editing.description ?? ""} onChange={(e) => setEditing((s) => ({ ...s, description: e.target.value }))} />
              </div>
              <div className="form-row">
                <div>
                  <label className="label">Price ($)</label>
                  <input className="input" type="number" step="0.01" required value={editing.price ?? 0} onChange={(e) => setEditing((s) => ({ ...s, price: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="label">Compare price ($)</label>
                  <input className="input" type="number" step="0.01" value={editing.comparePrice ?? ""} onChange={(e) => setEditing((s) => ({ ...s, comparePrice: e.target.value ? Number(e.target.value) : null }))} />
                </div>
              </div>
              <div className="form-row">
                <div>
                  <label className="label">Stock</label>
                  <input className="input" type="number" required value={editing.stock ?? 0} onChange={(e) => setEditing((s) => ({ ...s, stock: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={editing.categoryId ?? ""} onChange={(e) => setEditing((s) => ({ ...s, categoryId: e.target.value }))} required>
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Image URL</label>
                <input className="input" required value={editing.imageUrl ?? ""} onChange={(e) => setEditing((s) => ({ ...s, imageUrl: e.target.value }))} />
              </div>
              <div className="form-row">
                <div>
                  <label className="label">Badge</label>
                  <select className="input" value={editing.badge ?? ""} onChange={(e) => setEditing((s) => ({ ...s, badge: e.target.value || null }))}>
                    <option value="">None</option>
                    <option value="NEW">NEW</option>
                    <option value="SALE">SALE</option>
                    <option value="BESTSELLER">BESTSELLER</option>
                    <option value="HOT">HOT</option>
                  </select>
                </div>
                <div>
                  <label className="label">Tags (comma-separated)</label>
                  <input className="input" value={editing.tags ?? ""} onChange={(e) => setEditing((s) => ({ ...s, tags: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}>
                  <input type="checkbox" checked={Boolean(editing.isFeatured)} onChange={(e) => setEditing((s) => ({ ...s, isFeatured: e.target.checked }))} />
                  Featured
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}>
                  <input type="checkbox" checked={editing.isActive ?? true} onChange={(e) => setEditing((s) => ({ ...s, isActive: e.target.checked }))} />
                  Active
                </label>
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
