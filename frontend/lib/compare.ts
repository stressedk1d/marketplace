const STORAGE_KEY = "vw-compare-ids";
export const MAX_COMPARE = 3;

export function getCompareIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(Number).filter((id) => Number.isFinite(id) && id > 0).slice(0, MAX_COMPARE);
  } catch {
    return [];
  }
}

function saveCompareIds(ids: number[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_COMPARE)));
}

export type ToggleCompareResult =
  | { ok: true; ids: number[]; added: boolean }
  | { ok: false; reason: "max"; ids: number[] };

export function toggleCompare(productId: number): ToggleCompareResult {
  const ids = getCompareIds();
  const idx = ids.indexOf(productId);
  if (idx >= 0) {
    const next = ids.filter((id) => id !== productId);
    saveCompareIds(next);
    window.dispatchEvent(new CustomEvent("vw-compare-change", { detail: next }));
    return { ok: true, ids: next, added: false };
  }
  if (ids.length >= MAX_COMPARE) {
    return { ok: false, reason: "max", ids };
  }
  const next = [...ids, productId];
  saveCompareIds(next);
  window.dispatchEvent(new CustomEvent("vw-compare-change", { detail: next }));
  return { ok: true, ids: next, added: true };
}

export function clearCompare(): void {
  saveCompareIds([]);
  window.dispatchEvent(new CustomEvent("vw-compare-change", { detail: [] }));
}

export function removeFromCompare(productId: number): number[] {
  const next = getCompareIds().filter((id) => id !== productId);
  saveCompareIds(next);
  window.dispatchEvent(new CustomEvent("vw-compare-change", { detail: next }));
  return next;
}
