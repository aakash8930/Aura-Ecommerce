"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV: { href: string; label: string }[] = [
  { href: "/account", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/addresses", label: "Addresses" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="container" style={{ padding: "6rem 0", textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <header style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, var(--accent-color), #8b5cf6)", color: "white", fontWeight: 800, fontSize: "1.4rem" }}>
          {(user.name ?? user.email)[0].toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{user.name ?? user.email}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{user.email}</p>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "2rem" }}>
        <aside style={{ display: "flex", flexDirection: "column", gap: "0.25rem", position: "sticky", top: 90, alignSelf: "flex-start" }}>
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== "/account" && pathname.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                style={{
                  padding: "0.65rem 0.85rem",
                  borderRadius: 8,
                  background: active ? "var(--accent-light)" : undefined,
                  color: active ? "var(--accent-color)" : "var(--text-secondary)",
                  fontWeight: active ? 600 : 400,
                  fontSize: "0.92rem",
                }}
              >
                {n.label}
              </Link>
            );
          })}
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}
