import { useAppStore } from "@/store/useAppStore";

// ── API Client ────────────────────────────────────────────────────────────

const BASE_URL = "http://127.0.0.1:8000";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

interface ApiError {
  message: string;
  status: number;
  detail?: unknown;
}

class ApiClientError extends Error {
  status: number;
  detail?: unknown;

  constructor({ message, status, detail }: ApiError) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Reads the auth token from localStorage (set by useAuth on login).
 * Returns null if not available (e.g. during SSR).
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const storeToken = useAppStore.getState().token;
  if (storeToken) return storeToken;
  return localStorage.getItem("agentops_token");
}

/**
 * Core fetch wrapper. All service calls go through here.
 */
async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, signal } = options;

  const token = getAuthToken();
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== "undefined") {
        useAppStore.getState().clearAuth();
        window.location.href = "/login";
      }
    }

    let detail: unknown;
    try {
      detail = await response.json();
    } catch {
      detail = response.statusText;
    }

    throw new ApiClientError({
      message: `API error ${response.status}: ${path}`,
      status: response.status,
      detail,
    });
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ── Exported API Client ───────────────────────────────────────────────────

export const apiClient = {
  get: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "GET" }),

  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...opts, method: "POST", body }),

  put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...opts, method: "PUT", body }),

  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...opts, method: "PATCH", body }),

  delete: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "DELETE" }),
};

export { ApiClientError };
export type { ApiError };
