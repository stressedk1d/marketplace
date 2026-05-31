const STORAGE_KEY = "vw-catalog-filters";

export function saveCatalogQuery(query: string): void {
  if (typeof window === "undefined") return;
  try {
    if (!query.trim()) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, query);
  } catch {
    /* ignore quota */
  }
}

export function getSavedCatalogQuery(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
