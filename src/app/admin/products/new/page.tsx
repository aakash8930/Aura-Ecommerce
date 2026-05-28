import { createProduct } from "@/actions/adminActions";
import { getCategories } from "@/actions/categoryActions";
import { redirect } from "next/navigation";

export default async function NewProductPage() {
  const categories = await getCategories();

  async function handleSubmit(formData: FormData) {
    "use server";
    await createProduct({
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      comparePrice: formData.get("comparePrice") ? parseFloat(formData.get("comparePrice") as string) : undefined,
      imageUrl: formData.get("imageUrl") as string,
      categoryId: formData.get("categoryId") as string,
      badge: (formData.get("badge") as string) || undefined,
      stock: parseInt(formData.get("stock") as string) || 100,
      tags: formData.get("tags") as string,
      isFeatured: formData.get("isFeatured") === "on",
    });
    redirect("/admin/products");
  }

  return (
    <div>
      <h1 className="admin-page-title" style={{ marginBottom: '2rem' }}>Add New Product</h1>
      <form action={handleSubmit} className="admin-form glass admin-card">
        <div className="form-group">
          <label className="form-label">Product Name *</label>
          <input type="text" name="name" required className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">URL Slug *</label>
          <input type="text" name="slug" required className="form-input" placeholder="my-product-name" />
        </div>
        <div className="admin-form-row">
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select name="categoryId" required className="form-input">
              <option value="">Select...</option>
              {(categories as any[]).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Badge</label>
            <select name="badge" className="form-input">
              <option value="">None</option>
              <option value="NEW">NEW</option>
              <option value="SALE">SALE</option>
              <option value="BESTSELLER">BESTSELLER</option>
              <option value="HOT">HOT</option>
            </select>
          </div>
        </div>
        <div className="admin-form-row">
          <div className="form-group">
            <label className="form-label">Price ($) *</label>
            <input type="number" name="price" step="0.01" required className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Compare Price ($)</label>
            <input type="number" name="comparePrice" step="0.01" className="form-input" placeholder="Optional" />
          </div>
        </div>
        <div className="admin-form-row">
          <div className="form-group">
            <label className="form-label">Stock</label>
            <input type="number" name="stock" defaultValue="100" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input type="text" name="tags" className="form-input" placeholder="design,ui,dark-mode" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Image URL *</label>
          <input type="text" name="imageUrl" defaultValue="/images/dashboard.png" required className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea name="description" rows={4} required className="form-input" style={{ resize: 'vertical' }}></textarea>
        </div>
        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
          <input type="checkbox" name="isFeatured" id="isFeatured" />
          <label htmlFor="isFeatured" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Featured on homepage</label>
        </div>
        <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Create Product</button>
      </form>
    </div>
  );
}
