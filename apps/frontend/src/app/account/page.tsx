"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "@/components/Toaster";

export default function AccountProfilePage() {
  const { user, accessToken, refresh } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [busy, setBusy] = useState(false);
  const [pwd, setPwd] = useState({ current: "", next: "" });

  useEffect(() => {
    if (user) setName(user.name ?? "");
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setBusy(true);
    try {
      await api.patch("/api/auth/me", { name }, { token: accessToken });
      await refresh();
      toast("Profile saved", "success");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  const changePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setBusy(true);
    try {
      await api.post("/api/auth/change-password", { currentPassword: pwd.current, newPassword: pwd.next }, { token: accessToken });
      setPwd({ current: "", next: "" });
      toast("Password updated", "success");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <form onSubmit={saveProfile} className="glass" style={{ padding: "1.5rem", borderRadius: 12, display: "grid", gap: "1rem" }}>
        <h2 style={{ fontWeight: 700 }}>Profile</h2>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" value={user?.email ?? ""} disabled />
        </div>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary" disabled={busy} style={{ alignSelf: "flex-start" }}>Save</button>
      </form>

      <form onSubmit={changePwd} className="glass" style={{ padding: "1.5rem", borderRadius: 12, display: "grid", gap: "1rem" }}>
        <h2 style={{ fontWeight: 700 }}>Change password</h2>
        <div className="form-group">
          <label className="form-label">Current password</label>
          <input type="password" className="form-input" value={pwd.current} onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label className="form-label">New password</label>
          <input type="password" minLength={8} className="form-input" value={pwd.next} onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))} required />
        </div>
        <button type="submit" className="btn-primary" disabled={busy} style={{ alignSelf: "flex-start" }}>Update password</button>
      </form>
    </div>
  );
}
