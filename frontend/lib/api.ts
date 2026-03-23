export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

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
