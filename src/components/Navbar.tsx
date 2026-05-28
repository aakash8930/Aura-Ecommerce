"use client";

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav className="navbar glass">
        <div className="container nav-container">
          <Link href="/" className="logo">
            <span className="logo-icon">▲</span> AURA
          </Link>

          <div className="nav-center hide-mobile">
            <Link href="/products" className="nav-link">Store</Link>
            <Link href="/categories" className="nav-link">Categories</Link>
            <Link href="/products?sortBy=rating" className="nav-link">Top Rated</Link>
          </div>

          <div className="nav-actions">
            <button className="icon-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
            <button className="hamburger hide-desktop" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? <path d="M18 6 6 18M6 6l12 12"/> : <><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></>}
              </svg>
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="search-dropdown glass">
            <form onSubmit={handleSearch} className="search-form">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search products, categories, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="search-input"
              />
              <button type="submit" className="search-submit">Search</button>
            </form>
          </div>
        )}
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-menu glass">
          <Link href="/products" onClick={() => setMobileMenuOpen(false)}>Store</Link>
          <Link href="/categories" onClick={() => setMobileMenuOpen(false)}>Categories</Link>
          <Link href="/products?sortBy=rating" onClick={() => setMobileMenuOpen(false)}>Top Rated</Link>
          <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
        </div>
      )}
    </>
  );
}
