"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  setSession: (accessToken: string, refreshToken: string, user?: User) => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

const ACCESS_KEY = "aura.accessToken";
const REFRESH_KEY = "aura.refreshToken";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persistTokens = (access: string | null, refresh: string | null) => {
    if (typeof window === "undefined") return;
    if (access) localStorage.setItem(ACCESS_KEY, access);
    else localStorage.removeItem(ACCESS_KEY);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    else localStorage.removeItem(REFRESH_KEY);
  };

  const loadMe = useCallback(async (token: string) => {
    try {
      const { user } = await api.get<{ user: User }>("/api/auth/me", { token });
      setUser(user);
    } catch {
      setUser(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;
    const rt = localStorage.getItem(REFRESH_KEY);
    if (!rt) return;
    try {
      const data = await api.post<{ accessToken: string; refreshToken: string; user: User }>(
        "/api/auth/refresh",
        { refreshToken: rt }
      );
      persistTokens(data.accessToken, data.refreshToken);
      setAccessToken(data.accessToken);
      setUser(data.user);
    } catch {
      persistTokens(null, null);
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const access = localStorage.getItem(ACCESS_KEY);
    if (access) {
      setAccessToken(access);
      loadMe(access).finally(() => setLoading(false));
    } else {
      // Try refresh token if present
      const rt = localStorage.getItem(REFRESH_KEY);
      if (rt) {
        refresh().finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, [loadMe, refresh]);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ accessToken: string; refreshToken: string; user: User }>(
      "/api/auth/login",
      { email, password }
    );
    persistTokens(data.accessToken, data.refreshToken);
    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const register = async (email: string, password: string, name?: string) => {
    const data = await api.post<{ accessToken: string; refreshToken: string; user: User }>(
      "/api/auth/register",
      { email, password, name }
    );
    persistTokens(data.accessToken, data.refreshToken);
    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const setSession: AuthCtx["setSession"] = async (access, refresh, providedUser) => {
    persistTokens(access, refresh);
    setAccessToken(access);
    if (providedUser) setUser(providedUser);
    else await loadMe(access);
  };

  const logout = async () => {
    const rt = typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null;
    try {
      await api.post("/api/auth/logout", { refreshToken: rt });
    } catch {
      /* ignore */
    }
    persistTokens(null, null);
    setAccessToken(null);
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, accessToken, login, register, logout, setSession, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}

export function getStoredAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}
