"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Backend redirects here after Google OAuth with tokens in the URL hash:
//   /auth/callback#accessToken=…&refreshToken=…
export default function OAuthCallback() {
  const { setSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
    const params = new URLSearchParams(hash);
    const access = params.get("accessToken");
    const refresh = params.get("refreshToken");
    if (!access || !refresh) {
      router.replace("/login?error=oauth");
      return;
    }
    setSession(access, refresh).then(() => {
      window.history.replaceState(null, "", "/account");
      router.replace("/account");
      router.refresh();
    });
  }, [router, setSession]);

  return (
    <div className="container" style={{ padding: "6rem 0", textAlign: "center" }}>
      <p style={{ color: "var(--text-secondary)" }}>Signing you in…</p>
    </div>
  );
}
