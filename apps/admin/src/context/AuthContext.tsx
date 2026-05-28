import { createContext, useContext, useEffect, useState } from "react";
import { api, tokens } from "../lib/api";

type User = { id: string; email: string; name: string | null; role: "USER" | "ADMIN" };
type Ctx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const C = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokens.getAccess() && !tokens.getRefresh()) {
      setLoading(false);
      return;
    }
    api
      .get<{ user: User }>("/api/auth/me")
      .then(({ user }) => {
        if (user.role !== "ADMIN") {
          tokens.set(null, null);
          setUser(null);
          return;
        }
        setUser(user);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ accessToken: string; refreshToken: string; user: User }>("/api/auth/login", {
      email,
      password,
    });
    if (res.user.role !== "ADMIN") throw new Error("This account is not an admin");
    tokens.set(res.accessToken, res.refreshToken);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout", { refreshToken: tokens.getRefresh() });
    } catch {
      /* ignore */
    }
    tokens.set(null, null);
    setUser(null);
  };

  return <C.Provider value={{ user, loading, login, logout }}>{children}</C.Provider>;
}

export function useAuth() {
  const v = useContext(C);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
