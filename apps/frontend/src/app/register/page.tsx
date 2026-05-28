"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PUBLIC_API_URL } from "@/lib/api";
import { toast } from "@/components/Toaster";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/account";
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(email, password, name || undefined);
      toast("Account created", "success");
      router.push(next);
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 460, paddingTop: "4rem", paddingBottom: "6rem" }}>
      <div className="glass" style={{ padding: "2.25rem", borderRadius: 16 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.4rem" }}>Create your account</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          Get started with Aura — it's free
        </p>

        <a href={`${PUBLIC_API_URL}/api/auth/google`} className="btn-secondary" style={{ width: "100%", marginBottom: "1.25rem", padding: "0.75rem" }}>
          Continue with Google
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.25rem 0", color: "var(--text-muted)", fontSize: "0.8rem" }}>
          <span style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
          or
          <span style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
        </div>

        <form onSubmit={submit} style={{ display: "grid", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" required className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" required minLength={8} className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            <small style={{ color: "var(--text-muted)" }}>At least 8 characters</small>
          </div>
          <button type="submit" className="btn-primary" style={{ padding: "0.85rem", marginTop: "0.5rem" }} disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--text-secondary)", textAlign: "center" }}>
          Already have an account?{" "}
          <Link href={`/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} style={{ color: "var(--accent-color)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
