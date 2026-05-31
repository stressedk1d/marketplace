const STORAGE_KEY = "vw-recent-searches";
const MAX = 5;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(query: string): void {
  const q = query.trim();
  if (!q || typeof window === "undefined") return;
  const prev = getRecentSearches().filter((item) => item !== q);
  const next = [q, ...prev].slice(0, MAX);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
