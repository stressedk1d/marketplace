/**
 * SSR в Docker — прямое обращение к backend:8000.
 * Браузер — через /api prefix, Next.js rewrites проксирует на backend.
 */
export function apiUrl(path: string): string {
  if (typeof window === "undefined") {
    const internal = process.env.API_INTERNAL_URL?.trim();
    if (internal) return `${internal.replace(/\/$/, "")}${path}`;
  }
  return `/api${path}`;
}

export const API_BASE_URL = typeof window === "undefined"
  ? (process.env.API_INTERNAL_URL?.trim()?.replace(/\/$/, "") ?? "http://localhost:8000")
  : "/api";

/**
 * fetch с автоматическим редиректом на /login при 401.
 * Бросает Error("SESSION_EXPIRED") — страница показывает inline-сообщение.
 */
export async function apiFetch(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    throw new Error("SESSION_EXPIRED");
  }
  return res;
}
