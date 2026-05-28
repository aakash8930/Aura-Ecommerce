"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { api } from "@/lib/api";

interface WishlistCtx {
  ids: Set<string>;
  add: (productId: string) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  toggle: (productId: string) => Promise<void>;
  has: (productId: string) => boolean;
}

const Ctx = createContext<WishlistCtx | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  const reload = useCallback(async () => {
    if (!accessToken) {
      setIds(new Set());
      return;
    }
    try {
      const { items } = await api.get<{ items: { productId: string }[] }>("/api/wishlist", { token: accessToken });
      setIds(new Set(items.map((i) => i.productId)));
    } catch {
      setIds(new Set());
    }
  }, [accessToken]);

  useEffect(() => {
    reload();
  }, [reload]);

  const add = async (productId: string) => {
    if (!accessToken) throw new Error("Sign in to use the wishlist");
    await api.post("/api/wishlist", { productId }, { token: accessToken });
    setIds((s) => new Set(s).add(productId));
  };

  const remove = async (productId: string) => {
    if (!accessToken) return;
    await api.del(`/api/wishlist/${productId}`, { token: accessToken });
    setIds((s) => {
      const next = new Set(s);
      next.delete(productId);
      return next;
    });
  };

  const toggle = async (productId: string) => {
    if (ids.has(productId)) await remove(productId);
    else await add(productId);
  };

  return <Ctx.Provider value={{ ids, add, remove, toggle, has: (id) => ids.has(id) }}>{children}</Ctx.Provider>;
}

export function useWishlist() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWishlist must be used within WishlistProvider");
  return v;
}
