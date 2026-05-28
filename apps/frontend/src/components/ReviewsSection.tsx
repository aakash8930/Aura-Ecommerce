"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "./Toaster";
import type { Review } from "@/lib/types";

function Stars({ value }: { value: number }) {
  return (
    <span className="stars">
      {[...Array(5)].map((_, i) => (
        <span key={i} style={{ opacity: i < value ? 1 : 0.2 }}>★</span>
      ))}
    </span>
  );
}

export default function ReviewsSection({ productId, initialReviews }: { productId: string; initialReviews: Review[] }) {
  const { user, accessToken } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setBusy(true);
    try {
      const { review } = await api.post<{ review: Review }>(
        "/api/account/reviews",
        { productId, rating, title, comment },
        { token: accessToken }
      );
      setReviews((r) => [review, ...r]);
      setOpen(false);
      setRating(5);
      setTitle("");
      setComment("");
      toast("Review posted", "success");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section style={{ marginTop: "4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 700 }}>Customer reviews ({reviews.length})</h2>
        {user && !open && (
          <button className="btn-secondary" onClick={() => setOpen(true)}>Write a review</button>
        )}
        {!user && <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Sign in to write a review</span>}
      </div>

      {open && (
        <form onSubmit={submit} className="glass" style={{ padding: "1.5rem", borderRadius: 12, marginBottom: "1.5rem", display: "grid", gap: 12 }}>
          <div>
            <label className="form-label">Rating</label>
            <div style={{ display: "flex", gap: 4, fontSize: "1.5rem", color: "#fbbf24" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setRating(n)} style={{ opacity: n <= rating ? 1 : 0.3 }}>
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Title (optional)</label>
            <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
          </div>
          <div>
            <label className="form-label">Your review</label>
            <textarea
              className="form-input"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              minLength={1}
              maxLength={2000}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn-primary" disabled={busy}>{busy ? "Posting…" : "Post review"}</button>
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>No reviews yet. Be the first to share your experience.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {reviews.map((r) => (
            <article key={r.id} className="glass" style={{ padding: "1.25rem", borderRadius: 12 }}>
              <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, var(--accent-color), #8b5cf6)", color: "white", fontWeight: 700 }}>
                  {r.userName[0].toUpperCase()}
                </div>
                <div>
                  <strong>{r.userName}</strong>
                  {r.verifiedPurchase && (
                    <span style={{ marginLeft: 8, fontSize: "0.7rem", color: "var(--success)", background: "var(--success-bg)", padding: "0.15rem 0.5rem", borderRadius: 4 }}>
                      ✓ verified purchase
                    </span>
                  )}
                  <Stars value={r.rating} />
                </div>
              </header>
              {r.title && <h4 style={{ marginBottom: 4 }}>{r.title}</h4>}
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{r.comment}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
