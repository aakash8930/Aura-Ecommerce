import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h3><span className="logo-mark" style={{ display: "inline-flex", marginRight: 8 }}>▲</span> AURA</h3>
          <p>Premium digital assets for modern creators. Curated, vetted, and built to ship.</p>
          <div className="footer-social">
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="GitHub">⌘</a>
            <a href="#" aria-label="Discord">◉</a>
          </div>
        </div>
        <div className="footer-column">
          <h4>Shop</h4>
          <Link href="/categories">All categories</Link>
          <Link href="/products">All products</Link>
          <Link href="/products?sortBy=rating">Top rated</Link>
          <Link href="/products?badge=SALE">On sale</Link>
        </div>
        <div className="footer-column">
          <h4>Account</h4>
          <Link href="/login">Sign in</Link>
          <Link href="/register">Create account</Link>
          <Link href="/account/orders">Orders</Link>
          <Link href="/account/wishlist">Wishlist</Link>
        </div>
        <div className="footer-column">
          <h4>Support</h4>
          <a href="#">Help center</a>
          <a href="#">Contact</a>
          <a href="#">License</a>
          <a href="#">Refund policy</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Aura Inc. — A demo storefront</p>
        <div className="footer-legal">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </div>
      <style>{`
        .footer { margin-top: 6rem; border-top: 1px solid var(--border-color); padding: 4rem 1.5rem 2rem; background: linear-gradient(180deg, transparent, var(--bg-secondary)); }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem; }
        .footer-brand h3 { font-size: 1.25rem; margin-bottom: 0.75rem; }
        .footer-brand p { color: var(--text-secondary); font-size: 0.9rem; max-width: 320px; margin-bottom: 1.25rem; }
        .footer-social { display: flex; gap: 0.75rem; }
        .footer-social a { width: 36px; height: 36px; border-radius: var(--radius-full); display: inline-flex; align-items: center; justify-content: center; background: var(--bg-glass-light); border: 1px solid var(--border-color); color: var(--text-secondary); }
        .footer-social a:hover { background: var(--accent-light); color: var(--accent-color); border-color: var(--accent-color); }
        .footer-column { display: flex; flex-direction: column; gap: 0.6rem; }
        .footer-column h4 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-primary); margin-bottom: 0.4rem; }
        .footer-column a { color: var(--text-secondary); font-size: 0.9rem; }
        .footer-bottom { max-width: 1280px; margin: 3rem auto 0; padding-top: 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; color: var(--text-muted); font-size: 0.85rem; }
        .footer-legal { display: flex; gap: 1.25rem; }
        @media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; } .footer-bottom { flex-direction: column; gap: 0.75rem; } }
      `}</style>
    </footer>
  );
}
