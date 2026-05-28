"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(q.trim())}`;
    }
  };

  return (
    <>
      <nav className="navbar glass">
        <div className="container nav-container">
          <Link href="/" className="logo">
            <span className="logo-mark">▲</span> AURA
          </Link>

          <div className="nav-center hide-mobile">
            <Link href="/products" className="nav-link">Shop</Link>
            <Link href="/categories" className="nav-link">Categories</Link>
            <Link href="/products?sortBy=rating" className="nav-link">Top rated</Link>
            <Link href="/products?badge=SALE" className="nav-link">Deals</Link>
          </div>

          <div className="nav-actions">
            <button className="icon-btn" onClick={() => setSearchOpen((v) => !v)} aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>

            {user ? (
              <Link href="/account/wishlist" className="icon-btn hide-mobile" aria-label="Wishlist">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </Link>
            ) : null}

            <button className="cart-btn" onClick={() => setIsCartOpen(true)} aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>

            {user ? (
              <div className="account-wrap">
                <button className="account-btn" onClick={() => setAccountOpen((v) => !v)}>
                  <span className="avatar">{(user.name ?? user.email)[0].toUpperCase()}</span>
                  <span className="hide-mobile">{user.name ?? user.email.split("@")[0]}</span>
                </button>
                {accountOpen && (
                  <div className="account-menu glass" onMouseLeave={() => setAccountOpen(false)}>
                    <Link href="/account">Profile</Link>
                    <Link href="/account/orders">Orders</Link>
                    <Link href="/account/wishlist">Wishlist</Link>
                    <Link href="/account/addresses">Addresses</Link>
                    <button onClick={() => logout()}>Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn-secondary hide-mobile" style={{ padding: "0.5rem 1rem" }}>
                Sign in
              </Link>
            )}

            <button className="hamburger hide-desktop" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>}
              </svg>
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="search-dropdown glass">
            <form onSubmit={handleSearch} className="search-form">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, tags, categories…" autoFocus className="search-input" />
              <button type="submit" className="search-submit">Search</button>
            </form>
          </div>
        )}
      </nav>

      {menuOpen && (
        <div className="mobile-menu glass">
          <Link href="/products" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link href="/categories" onClick={() => setMenuOpen(false)}>Categories</Link>
          <Link href="/products?sortBy=rating" onClick={() => setMenuOpen(false)}>Top rated</Link>
          <Link href="/products?badge=SALE" onClick={() => setMenuOpen(false)}>Deals</Link>
          {user ? (
            <>
              <Link href="/account" onClick={() => setMenuOpen(false)}>Account</Link>
              <button onClick={() => { logout(); setMenuOpen(false); }}>Sign out</button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>
          )}
        </div>
      )}
    </>
  );
}
