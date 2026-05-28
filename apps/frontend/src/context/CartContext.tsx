"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { api } from "@/lib/api";
import type { Cart, CartItem, Product } from "@/lib/types";

interface CartCtx {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  reload: () => Promise<void>;
}

const Ctx = createContext<CartCtx | undefined>(undefined);

const LOCAL_KEY = "aura.cart";
type LocalEntry = { product: Product; quantity: number };

function readLocal(): LocalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeLocal(items: LocalEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

function localToItems(local: LocalEntry[]): CartItem[] {
  return local.map((e, i) => ({
    id: `local-${i}-${e.product.id}`,
    productId: e.product.id,
    quantity: e.quantity,
    product: e.product,
  }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const merged = useRef(false);

  useEffect(() => {
    if (!user) {
      setItems(localToItems(readLocal()));
    }
  }, [user]);

  const reload = useCallback(async () => {
    if (!accessToken) return;
    const { cart } = await api.get<{ cart: Cart }>("/api/cart", { token: accessToken });
    setItems(cart.items);
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || !user || merged.current) return;
    merged.current = true;
    const local = readLocal();
    if (local.length === 0) {
      reload();
      return;
    }
    api
      .post<{ cart: Cart }>(
        "/api/cart/merge",
        { items: local.map((l) => ({ productId: l.product.id, quantity: l.quantity })) },
        { token: accessToken }
      )
      .then(({ cart }) => {
        setItems(cart.items);
        writeLocal([]);
      })
      .catch(() => reload());
  }, [accessToken, user, reload]);

  const persistLocal = (next: LocalEntry[]) => {
    writeLocal(next);
    setItems(localToItems(next));
  };

  const addToCart = async (product: Product, quantity = 1) => {
    if (accessToken) {
      const { cart } = await api.post<{ cart: Cart }>(
        "/api/cart/items",
        { productId: product.id, quantity },
        { token: accessToken }
      );
      setItems(cart.items);
    } else {
      const local = readLocal();
      const existing = local.find((l) => l.product.id === product.id);
      if (existing) existing.quantity += quantity;
      else local.push({ product, quantity });
      persistLocal(local);
    }
    setIsCartOpen(true);
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (accessToken && !itemId.startsWith("local-")) {
      const { cart } = await api.patch<{ cart: Cart }>(
        `/api/cart/items/${itemId}`,
        { quantity },
        { token: accessToken }
      );
      setItems(cart.items);
    } else {
      const productId = itemId.replace(/^local-\d+-/, "");
      const local = readLocal();
      const idx = local.findIndex((l) => l.product.id === productId);
      if (idx >= 0) {
        if (quantity <= 0) local.splice(idx, 1);
        else local[idx].quantity = quantity;
      }
      persistLocal(local);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (accessToken && !itemId.startsWith("local-")) {
      const { cart } = await api.del<{ cart: Cart }>(`/api/cart/items/${itemId}`, { token: accessToken });
      setItems(cart.items);
    } else {
      const productId = itemId.replace(/^local-\d+-/, "");
      const local = readLocal().filter((l) => l.product.id !== productId);
      persistLocal(local);
    }
  };

  const clearCart = async () => {
    if (accessToken) {
      await api.del("/api/cart", { token: accessToken });
      setItems([]);
    } else {
      persistLocal([]);
    }
  };

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <Ctx.Provider
      value={{ items, cartCount, cartTotal, isCartOpen, setIsCartOpen, addToCart, updateQuantity, removeFromCart, clearCart, reload }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used within CartProvider");
  return v;
}
