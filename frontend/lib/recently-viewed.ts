export const RECENTLY_VIEWED_KEY = "recently_viewed";

export type RecentProductSnapshot = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
};

function parseList(raw: string | null): RecentProductSnapshot[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(
      (x): x is RecentProductSnapshot =>
        typeof x === "object" &&
        x !== null &&
        typeof (x as RecentProductSnapshot).id === "number" &&
        typeof (x as RecentProductSnapshot).name === "string" &&
        typeof (x as RecentProductSnapshot).price === "number"
    );
  } catch {
    return [];
  }
}

/** Сохранить просмотр: уникальные id, не более 10, новые сверху. */
export function recordProductView(entry: RecentProductSnapshot): void {
  if (typeof window === "undefined") return;
  const list = parseList(localStorage.getItem(RECENTLY_VIEWED_KEY));
  const next = [
    entry,
    ...list.filter((p) => p.id !== entry.id),
  ].slice(0, 10);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("vw-recently-viewed"));
}

export function getRecentlyViewed(): RecentProductSnapshot[] {
  if (typeof window === "undefined") return [];
  return parseList(localStorage.getItem(RECENTLY_VIEWED_KEY));
}

export function replaceRecentlyViewed(items: RecentProductSnapshot[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items.slice(0, 10)));
  window.dispatchEvent(new Event("vw-recently-viewed"));
}
