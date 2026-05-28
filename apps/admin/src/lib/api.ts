const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:4000";

const ACCESS_KEY = "aura.admin.access";
const REFRESH_KEY = "aura.admin.refresh";

export const tokens = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (a: string | null, r: string | null) => {
    if (a) localStorage.setItem(ACCESS_KEY, a);
    else localStorage.removeItem(ACCESS_KEY);
    if (r) localStorage.setItem(REFRESH_KEY, r);
    else localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

async function refreshSession(): Promise<string | null> {
  const rt = tokens.getRefresh();
  if (!rt) return null;
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) {
      tokens.set(null, null);
      return null;
    }
    const data = await res.json();
    tokens.set(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  const token = tokens.getAccess();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (res.status === 401 && retry) {
    const fresh = await refreshSession();
    if (fresh) return apiFetch<T>(path, init, false);
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(res.status, data?.error ?? res.statusText, data?.details);
  return data as T;
}

export const api = {
  get: <T>(p: string) => apiFetch<T>(p),
  post: <T>(p: string, b?: unknown) => apiFetch<T>(p, { method: "POST", body: b ? JSON.stringify(b) : undefined }),
  patch: <T>(p: string, b?: unknown) => apiFetch<T>(p, { method: "PATCH", body: b ? JSON.stringify(b) : undefined }),
  del: <T>(p: string) => apiFetch<T>(p, { method: "DELETE" }),
};

export { API_URL };
