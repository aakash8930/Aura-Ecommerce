import { getProductById } from "@/actions/productActions";
import { updateProduct } from "@/actions/adminActions";
import { getCategories } from "@/actions/categoryActions";
import { redirect, notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const [product, categories] = await Promise.all([
    getProductById(resolvedParams.id),
    getCategories(),
  ]);

  if (!product) notFound();

  async function handleSubmit(formData: FormData) {
    "use server";
    await updateProduct(resolvedParams.id, {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      comparePrice: formData.get("comparePrice") ? parseFloat(formData.get("comparePrice") as string) : null,
      imageUrl: formData.get("imageUrl") as string,
      categoryId: formData.get("categoryId") as string,
      badge: (formData.get("badge") as string) || null,
      stock: parseInt(formData.get("stock") as string) || 100,
      tags: formData.get("tags") as string,
      isFeatured: formData.get("isFeatured") === "on",
    });
    redirect("/admin/products");
  }

  return (
    <div>
      <h1 className="admin-page-title" style={{ marginBottom: '2rem' }}>Edit: {product.name}</h1>
      <form action={handleSubmit} className="admin-form glass admin-card">
        <div className="form-group">
          <label className="form-label">Product Name *</label>
          <input type="text" name="name" defaultValue={product.name} required className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">URL Slug *</label>
          <input type="text" name="slug" defaultValue={product.slug} required className="form-input" />
        </div>
        <div className="admin-form-row">
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select name="categoryId" defaultValue={product.categoryId} required className="form-input">
              {(categories as any[]).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Badge</label>
            <select name="badge" defaultValue={product.badge || ""} className="form-input">
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
            <input type="number" name="price" step="0.01" defaultValue={product.price} required className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Compare Price ($)</label>
            <input type="number" name="comparePrice" step="0.01" defaultValue={product.comparePrice || ""} className="form-input" />
          </div>
        </div>
        <div className="admin-form-row">
          <div className="form-group">
            <label className="form-label">Stock</label>
            <input type="number" name="stock" defaultValue={product.stock} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Tags</label>
            <input type="text" name="tags" defaultValue={product.tags} className="form-input" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Image URL *</label>
          <input type="text" name="imageUrl" defaultValue={product.imageUrl} required className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea name="description" rows={4} defaultValue={product.description} required className="form-input" style={{ resize: 'vertical' }}></textarea>
        </div>
        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
          <input type="checkbox" name="isFeatured" id="isFeatured" defaultChecked={product.isFeatured} />
          <label htmlFor="isFeatured" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Featured on homepage</label>
        </div>
        <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Save Changes</button>
      </form>
    </div>
  );
}
