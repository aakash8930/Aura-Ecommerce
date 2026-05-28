"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartSidebar() {
  const { isCartOpen, setIsCartOpen, items, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />
      <aside className="cart-sidebar">
        <header className="cart-header">
          <h2>Cart <span className="cart-header-count">({cartCount})</span></h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)} aria-label="Close cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty-cart">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ opacity: 0.3 }}>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <p>Your cart is empty</p>
              <button className="btn-secondary" onClick={() => setIsCartOpen(false)}>Continue shopping</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <Image src={item.product.imageUrl} alt={item.product.name} fill style={{ objectFit: "cover" }} />
                </div>
                <div className="cart-item-info">
                  <Link href={`/product/${item.product.slug}`} onClick={() => setIsCartOpen(false)} className="cart-item-name">
                    {item.product.name}
                  </Link>
                  <p className="cart-item-price">${item.product.price.toFixed(2)}</p>
                  <div className="cart-item-actions">
                    <div className="qty-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <footer className="cart-footer">
            <div className="cart-total">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <p className="cart-note">Shipping & taxes calculated at checkout</p>
            <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="btn-primary checkout-btn">
              Checkout
            </Link>
          </footer>
        )}
      </aside>

      <style>{`
        .cart-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 100; animation: fadeIn 0.2s ease; }
        .cart-sidebar { position: fixed; top: 0; right: 0; bottom: 0; width: min(420px, 100vw); background: var(--bg-secondary); border-left: 1px solid var(--border-color); display: flex; flex-direction: column; z-index: 101; animation: slideIn 0.25s ease; }
        .cart-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
        .cart-header h2 { font-size: 1.1rem; }
        .cart-header-count { color: var(--text-muted); font-weight: 400; }
        .close-btn { width: 36px; height: 36px; border-radius: var(--radius-full); color: var(--text-secondary); }
        .close-btn:hover { background: var(--bg-glass-light); color: var(--text-primary); }
        .cart-items { flex: 1; overflow-y: auto; padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .empty-cart { text-align: center; padding: 4rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; color: var(--text-secondary); }
        .cart-item { display: flex; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); }
        .cart-item-image { position: relative; width: 80px; height: 80px; border-radius: var(--radius-sm); overflow: hidden; background: var(--bg-tertiary); flex-shrink: 0; }
        .cart-item-info { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; min-width: 0; }
        .cart-item-name { font-size: 0.9rem; font-weight: 500; color: var(--text-primary); }
        .cart-item-name:hover { color: var(--accent-color); }
        .cart-item-price { font-size: 0.95rem; font-weight: 600; }
        .cart-item-actions { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
        .qty-controls { display: inline-flex; align-items: center; border: 1px solid var(--border-color); border-radius: var(--radius-sm); overflow: hidden; }
        .qty-controls button { width: 28px; height: 28px; color: var(--text-secondary); }
        .qty-controls button:hover { background: var(--bg-glass-light); color: var(--text-primary); }
        .qty-controls span { min-width: 28px; text-align: center; font-size: 0.85rem; }
        .remove-btn { font-size: 0.75rem; color: var(--text-muted); }
        .remove-btn:hover { color: var(--danger); }
        .cart-footer { padding: 1.25rem 1.5rem; border-top: 1px solid var(--border-color); }
        .cart-total { display: flex; justify-content: space-between; font-weight: 700; font-size: 1.1rem; margin-bottom: 0.4rem; }
        .cart-note { color: var(--text-muted); font-size: 0.8rem; margin-bottom: 1rem; }
        .checkout-btn { width: 100%; padding: 0.9rem; }
      `}</style>
    </>
  );
}
