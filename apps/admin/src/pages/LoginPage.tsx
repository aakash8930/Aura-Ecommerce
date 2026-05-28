import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@aura.com");
  const [password, setPassword] = useState("admin1234");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <form onSubmit={submit} className="panel" style={{ width: "100%", maxWidth: 380, padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
          <span className="logo-mark" style={{ width: 32, height: 32, borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, var(--accent), #8b5cf6)", color: "white", fontSize: "0.9rem" }}>▲</span>
          <div>
            <div style={{ fontWeight: 800, letterSpacing: "0.04em" }}>AURA</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-2)" }}>Admin panel</div>
          </div>
        </div>

        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.4rem" }}>Sign in</h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-2)", marginBottom: "1.5rem" }}>Use your admin credentials.</p>

        {error && (
          <div className="banner" style={{ background: "rgba(239,68,68,0.1)", borderColor: "var(--danger)", color: "var(--danger)" }}>
            {error}
          </div>
        )}

        <div className="form-grid">
          <div>
            <label className="label">Email</label>
            <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 6, padding: "10px 14px" }} disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </div>

        <p style={{ marginTop: "1.5rem", fontSize: "0.78rem", color: "var(--text-3)", textAlign: "center" }}>
          admin@aura.com / admin1234 (seeded)
        </p>
      </form>
    </div>
  );
}
