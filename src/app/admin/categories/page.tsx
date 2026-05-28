import { getCategories } from "@/actions/categoryActions";
import { createCategory, deleteCategory } from "@/actions/adminActions";
import { redirect } from "next/navigation";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  async function handleCreate(formData: FormData) {
    "use server";
    await createCategory({
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
    });
    redirect("/admin/categories");
  }

  return (
    <div>
      <h1 className="admin-page-title" style={{ marginBottom: '2rem' }}>Categories</h1>

      {/* Add Form */}
      <div className="admin-card glass" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Add New Category</h3>
        <form action={handleCreate} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label className="form-label">Name</label>
            <input type="text" name="name" required className="form-input" placeholder="Category Name" />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label className="form-label">Slug</label>
            <input type="text" name="slug" required className="form-input" placeholder="category-slug" />
          </div>
          <div className="form-group" style={{ flex: 2, minWidth: '200px' }}>
            <label className="form-label">Description</label>
            <input type="text" name="description" className="form-input" placeholder="Short description" />
          </div>
          <button type="submit" className="btn-primary" style={{ height: 'fit-content' }}>Add</button>
        </form>
      </div>

      {/* Categories Table */}
      <div className="admin-card glass">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Products</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(categories as any[]).map((cat) => (
              <tr key={cat.id}>
                <td style={{ fontWeight: 600 }}>{cat.name}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cat.slug}</td>
                <td>
                  <span style={{ background: 'var(--accent-light)', color: 'var(--accent-color)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600 }}>
                    {cat._count?.products || 0}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cat.description || '—'}
                </td>
                <td>
                  <form action={async () => { "use server"; await deleteCategory(cat.id); }}>
                    <button type="submit" className="btn-danger" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
