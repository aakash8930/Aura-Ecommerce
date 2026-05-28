import { getProducts } from "@/actions/productActions";
import { deleteProduct } from "@/actions/adminActions";
import Link from "next/link";
import Image from "next/image";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Products ({products.length})</h1>
        <Link href="/admin/products/new" className="btn-primary">+ Add Product</Link>
      </div>

      <div className="admin-card glass">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Rating</th>
              <th>Badge</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(products as any[]).map((product) => (
              <tr key={product.id}>
                <td>
                  <div style={{ position: 'relative', width: '44px', height: '44px', borderRadius: 'var(--radius-xs)', overflow: 'hidden' }}>
                    <Image src={product.imageUrl} alt={product.name} fill style={{ objectFit: 'cover' }} sizes="44px" />
                  </div>
                </td>
                <td style={{ fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{product.category?.name}</td>
                <td>
                  ${product.price.toFixed(2)}
                  {product.comparePrice && <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '0.5rem', fontSize: '0.8rem' }}>${product.comparePrice.toFixed(2)}</span>}
                </td>
                <td>
                  <span style={{ color: product.stock > 50 ? 'var(--success)' : 'var(--warning)' }}>{product.stock}</span>
                </td>
                <td>
                  <span className="stars" style={{ fontSize: '0.75rem' }}>★ {product.rating}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.25rem' }}>({product.reviewCount})</span>
                </td>
                <td>
                  {product.badge ? (
                    <span className={`badge badge-${product.badge.toLowerCase()}`}>{product.badge}</span>
                  ) : '—'}
                </td>
                <td className="admin-actions">
                  <Link href={`/admin/products/${product.id}/edit`} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-xs)' }}>
                    Edit
                  </Link>
                  <form action={async () => { "use server"; await deleteProduct(product.id); }}>
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
