/** Браузер — публичный URL; SSR в Docker — внутренний backend:8000 */
export function getApiBaseUrl(): string {
  const internal = process.env.API_INTERNAL_URL?.trim();
  if (typeof window === "undefined" && internal) {
    return internal.replace(/\/$/, "");
  }
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(
    /\/$/,
    ""
  );
}

export const API_BASE_URL = getApiBaseUrl();

export const apiUrl = (path: string) => `${getApiBaseUrl()}${path}`;

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
