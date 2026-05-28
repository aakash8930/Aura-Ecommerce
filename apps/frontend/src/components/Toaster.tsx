"use client";

import { useEffect, useState } from "react";

type Toast = { id: number; message: string; tone: "success" | "error" | "info" };

let push: ((t: Omit<Toast, "id">) => void) | null = null;

export function toast(message: string, tone: Toast["tone"] = "info") {
  push?.({ message, tone });
}

export default function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    push = (t) => {
      const id = Date.now() + Math.random();
      setItems((s) => [...s, { ...t, id }]);
      setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 3500);
    };
    return () => {
      push = null;
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {items.map((t) => (
        <div
          key={t.id}
          className="glass"
          style={{
            padding: "0.85rem 1.1rem",
            borderRadius: 12,
            minWidth: 280,
            borderLeft: `3px solid var(--${t.tone === "success" ? "success" : t.tone === "error" ? "danger" : "accent-color"})`,
            fontSize: "0.9rem",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
