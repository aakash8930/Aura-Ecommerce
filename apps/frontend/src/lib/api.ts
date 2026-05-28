// Universal fetch-based API client. Used from both Server and Client Components.
// On the client, the access token is read from localStorage; on the server it's
// injected by the caller (or omitted for public endpoints).

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiOptions = RequestInit & { token?: string | null };

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

export async function apiFetch<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers = new Headers(opts.headers);
  if (!headers.has("Content-Type") && opts.body && typeof opts.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  if (opts.token) headers.set("Authorization", `Bearer ${opts.token}`);

  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers,
    cache: opts.cache ?? "no-store",
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(res.status, data?.error ?? res.statusText, data?.details);
  return data as T;
}

export const api = {
  get: <T>(path: string, opts?: ApiOptions) => apiFetch<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: ApiOptions) =>
    apiFetch<T>(path, { ...opts, method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown, opts?: ApiOptions) =>
    apiFetch<T>(path, { ...opts, method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined }),
  del: <T>(path: string, opts?: ApiOptions) => apiFetch<T>(path, { ...opts, method: "DELETE" }),
};

export const PUBLIC_API_URL = API_URL;
