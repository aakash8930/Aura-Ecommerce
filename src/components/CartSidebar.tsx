"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import "./CartSidebar.css";

export default function CartSidebar() {
  const { isCartOpen, setIsCartOpen, items, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />
      <div className="cart-sidebar">
        <div className="cart-header">
          <h2>Shopping Cart <span className="cart-header-count">({cartCount})</span></h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)} aria-label="Close cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty-cart">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '1rem', opacity: 0.3 }}>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <p>Your cart is empty</p>
              <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setIsCartOpen(false)}>
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="cart-item">
                <div className="cart-item-image">
                  <Image src={item.product.imageUrl} alt={item.product.name} fill style={{ objectFit: 'cover' }} />
                </div>
                <div className="cart-item-info">
                  <h4>{item.product.name}</h4>
                  <p className="cart-item-price">${item.product.price.toFixed(2)}</p>
                  <div className="cart-item-actions">
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>−</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</button>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.product.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="btn-primary checkout-btn">
              Proceed to Checkout
            </Link>
            <button className="continue-shopping" onClick={() => setIsCartOpen(false)}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
