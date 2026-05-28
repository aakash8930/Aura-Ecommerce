"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "@/components/Toaster";
import type { Address, Order } from "@/lib/types";
import styles from "./checkout.module.css";

const SHIPPING_FREE_OVER = 75;
const TAX_RATE = 0.07;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCart();
  const { user, accessToken } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [shippingId, setShippingId] = useState<string | "new">("new");
  const [shipping, setShipping] = useState({ fullName: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "US", phone: "" });

  const [coupon, setCoupon] = useState("");
  const [couponState, setCouponState] = useState<{ code?: string; discount: number } | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);

  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<Order | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    api.get<{ items: Address[] }>("/api/addresses", { token: accessToken }).then(({ items }) => {
      setAddresses(items);
      const def = items.find((a) => a.isDefault) ?? items[0];
      if (def) setShippingId(def.id);
    });
  }, [accessToken]);

  const subtotal = cartTotal;
  const discount = couponState?.discount ?? 0;
  const taxableBase = Math.max(0, subtotal - discount);
  const shippingFee = subtotal >= SHIPPING_FREE_OVER || subtotal === 0 ? 0 : 7.99;
  const tax = Math.round(taxableBase * TAX_RATE * 100) / 100;
  const total = Math.round((taxableBase + shippingFee + tax) * 100) / 100;

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponBusy(true);
    try {
      const data = await api.post<{ coupon: { code: string }; discount: number }>("/api/coupons/validate", { code: coupon, subtotal });
      setCouponState({ code: data.coupon.code, discount: data.discount });
      toast(`Saved $${data.discount.toFixed(2)} with ${data.coupon.code}`, "success");
    } catch (err) {
      setCouponState(null);
      toast((err as Error).message, "error");
    } finally {
      setCouponBusy(false);
    }
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      router.push("/login?next=/checkout");
      return;
    }
    setBusy(true);
    try {
      const payload: any = { couponCode: couponState?.code };
      if (shippingId === "new") payload.shippingAddress = shipping;
      else payload.shippingAddressId = shippingId;

      const { order } = await api.post<{ order: Order; clientSecret: string | null }>("/api/account/checkout", payload, { token: accessToken });
      await clearCart();
      setSuccess(order);
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  if (success) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "6rem 0" }}>
        <div className={styles.successIcon}>✓</div>
        <h1 className={styles.title}>Order placed</h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: 520, margin: "0 auto 1.5rem" }}>
          Thanks for your order. Confirmation #{success.id.slice(-8).toUpperCase()} sent to <strong>{success.email}</strong>.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <Link href="/account/orders" className="btn-primary">View orders</Link>
          <Link href="/products" className="btn-secondary">Continue shopping</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "6rem 0" }}>
        <div className={styles.emptyIcon}>🛒</div>
        <h1 className={styles.title}>Your cart is empty</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Add a few items before checking out.</p>
        <Link href="/products" className="btn-primary">Continue shopping</Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "6rem 0" }}>
        <h1 className={styles.title}>Sign in to checkout</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Your cart is saved — sign in to complete the order.</p>
        <Link href="/login?next=/checkout" className="btn-primary">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1.5rem" }}>Checkout</h1>

      <div className={styles.checkoutLayout}>
        <form onSubmit={placeOrder} className={styles.formSection}>
          <section className="glass" style={{ padding: "1.5rem", borderRadius: 12, marginBottom: "1rem" }}>
            <h2 className={styles.stepTitle}>Shipping address</h2>

            {addresses.length > 0 && (
              <div style={{ display: "grid", gap: "0.5rem", marginBottom: "1rem" }}>
                {addresses.map((a) => (
                  <label key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "0.85rem", border: `1px solid ${shippingId === a.id ? "var(--accent-color)" : "var(--border-color)"}`, borderRadius: 10, cursor: "pointer" }}>
                    <input type="radio" name="addr" checked={shippingId === a.id} onChange={() => setShippingId(a.id)} />
                    <div>
                      <strong>{a.fullName}</strong>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                        {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city} {a.postalCode}, {a.country}
                      </p>
                    </div>
                  </label>
                ))}
                <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.85rem", border: `1px solid ${shippingId === "new" ? "var(--accent-color)" : "var(--border-color)"}`, borderRadius: 10, cursor: "pointer" }}>
                  <input type="radio" name="addr" checked={shippingId === "new"} onChange={() => setShippingId("new")} />
                  Use a new address
                </label>
              </div>
            )}

            {shippingId === "new" && (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <input className="form-input" placeholder="Full name" required value={shipping.fullName} onChange={(e) => setShipping((s) => ({ ...s, fullName: e.target.value }))} />
                  <input className="form-input" placeholder="Phone" value={shipping.phone} onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))} />
                </div>
                <input className="form-input" placeholder="Address" required value={shipping.line1} onChange={(e) => setShipping((s) => ({ ...s, line1: e.target.value }))} />
                <input className="form-input" placeholder="Apt / suite (optional)" value={shipping.line2} onChange={(e) => setShipping((s) => ({ ...s, line2: e.target.value }))} />
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0.75rem" }}>
                  <input className="form-input" placeholder="City" required value={shipping.city} onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))} />
                  <input className="form-input" placeholder="State" value={shipping.state} onChange={(e) => setShipping((s) => ({ ...s, state: e.target.value }))} />
                  <input className="form-input" placeholder="Postal code" required value={shipping.postalCode} onChange={(e) => setShipping((s) => ({ ...s, postalCode: e.target.value }))} />
                </div>
                <input className="form-input" placeholder="Country" required value={shipping.country} onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))} />
              </div>
            )}
          </section>

          <section className="glass" style={{ padding: "1.5rem", borderRadius: 12 }}>
            <h2 className={styles.stepTitle}>Payment</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Stripe is in test mode (or mock-pay if not configured). Use card{" "}
              <code style={{ background: "var(--bg-glass-light)", padding: "0.1rem 0.4rem", borderRadius: 4 }}>4242 4242 4242 4242</code> for tests.
            </p>
            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "1rem" }} disabled={busy}>
              {busy ? "Placing order…" : `Place order — $${total.toFixed(2)}`}
            </button>
          </section>
        </form>

        <aside className={styles.summarySection}>
          <div className="glass" style={{ padding: "1.5rem", borderRadius: 12, position: "sticky", top: 90 }}>
            <h3 className={styles.summaryTitle}>Order summary</h3>
            <div className={styles.summaryItems}>
              {items.map((item) => (
                <div key={item.id} className={styles.summaryItem}>
                  <div className={styles.summaryItemImage}>
                    <Image src={item.product.imageUrl} alt={item.product.name} fill style={{ objectFit: "cover" }} />
                    <span className={styles.summaryQty}>{item.quantity}</span>
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.product.name}</span>
                  </div>
                  <span className={styles.itemPrice}>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
              <input className="form-input" placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
              <button type="button" className="btn-secondary" onClick={applyCoupon} disabled={couponBusy} style={{ padding: "0.6rem 1rem" }}>
                Apply
              </button>
            </div>
            {couponState?.code && (
              <p style={{ color: "var(--success)", fontSize: "0.85rem", marginBottom: 8 }}>
                ✓ {couponState.code} applied — −${couponState.discount.toFixed(2)}
              </p>
            )}

            <div className={styles.totals}>
              <div className={styles.totalRow}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className={styles.totalRow}><span>Discount</span><span>−${discount.toFixed(2)}</span></div>}
              <div className={styles.totalRow}><span>Shipping</span><span>{shippingFee === 0 ? "Free" : `$${shippingFee.toFixed(2)}`}</span></div>
              <div className={styles.totalRow}><span>Tax</span><span>${tax.toFixed(2)}</span></div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
