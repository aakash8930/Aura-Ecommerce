import Link from 'next/link';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h3><span className="logo-icon">▲</span> AURA</h3>
          <p>Premium digital assets for modern creators. Discover curated designs, templates, and resources.</p>
          <div className="footer-social">
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="GitHub">⌘</a>
            <a href="#" aria-label="Discord">◉</a>
          </div>
        </div>
        <div className="footer-column">
          <h4>Shop</h4>
          <Link href="/categories">All Categories</Link>
          <Link href="/products">All Products</Link>
          <Link href="/products?sortBy=rating">Top Rated</Link>
          <Link href="/products?badge=SALE">Deals</Link>
        </div>
        <div className="footer-column">
          <h4>Company</h4>
          <a href="#">About Us</a>
          <a href="#">Careers</a>
          <a href="#">Blog</a>
          <a href="#">Press</a>
        </div>
        <div className="footer-column">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Contact</a>
          <a href="#">Refund Policy</a>
          <a href="#">License</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Aura Inc. All rights reserved.</p>
        <div className="footer-legal">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
