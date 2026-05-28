"use client";

import { useCart } from "@/context/CartContext";
import { createOrder } from "@/actions/orderActions";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import styles from "./checkout.module.css";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await createOrder({
        email,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        totalAmount: cartTotal,
      });
      clearCart();
      setIsSuccess(true);
    } catch (err) {
      console.error("Order failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "8rem 0" }}>
        <div className={styles.emptyIcon}>🛒</div>
        <h1 className={styles.title}>Your cart is empty</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Add some items before checking out.</p>
        <Link href="/products" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "8rem 0" }}>
        <div className={styles.successIcon}>✓</div>
        <h1 className={styles.title}>Order Placed Successfully!</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", maxWidth: '500px', margin: '0 auto 2rem' }}>
          Thank you for your purchase. A confirmation has been sent to <strong>{email}</strong>. You will receive download links shortly.
        </p>
        <Link href="/products" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Steps indicator */}
      <div className={styles.steps}>
        <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ''}`}>
          <span className={styles.stepNum}>1</span> Information
        </div>
        <div className={styles.stepDivider} />
        <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ''}`}>
          <span className={styles.stepNum}>2</span> Payment
        </div>
        <div className={styles.stepDivider} />
        <div className={`${styles.step} ${step >= 3 ? styles.stepActive : ''}`}>
          <span className={styles.stepNum}>3</span> Confirmation
        </div>
      </div>

      <div className={styles.checkoutLayout}>
        <div className={styles.formSection}>
          <form className={styles.form} onSubmit={handleCheckout}>
            {step === 1 && (
              <div className={styles.formStep}>
                <h2 className={styles.stepTitle}>Contact Information</h2>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" placeholder="your@email.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" required className="form-input" placeholder="John Doe" />
                </div>
                <button type="button" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => email && setStep(2)}>
                  Continue to Payment →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className={styles.formStep}>
                <h2 className={styles.stepTitle}>Payment Details</h2>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input type="text" required className="form-input" placeholder="4242 4242 4242 4242" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Expiry</label>
                    <input type="text" required className="form-input" placeholder="MM / YY" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVC</label>
                    <input type="text" required className="form-input" placeholder="123" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : `Pay $${cartTotal.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className={styles.summarySection}>
          <div className={`glass ${styles.summaryCard}`}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            <div className={styles.summaryItems}>
              {items.map((item) => (
                <div key={item.product.id} className={styles.summaryItem}>
                  <div className={styles.summaryItemImage}>
                    <Image src={item.product.imageUrl} alt={item.product.name} fill style={{ objectFit: 'cover' }} />
                    <span className={styles.summaryQty}>{item.quantity}</span>
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.product.name}</span>
                  </div>
                  <span className={styles.itemPrice}>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Tax</span><span>$0.00</span>
              </div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>Total</span><span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
