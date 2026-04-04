"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";

export function useWishlist() {
  const pathname = usePathname();
  const [ids, setIds] = useState<Set<number>>(new Set());
  const idsRef = useRef(ids);
  idsRef.current = ids;

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIds(new Set());
      return;
    }
    try {
      const res = await apiFetch(apiUrl("/wishlist"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: { id: number }[] = await res.json();
        const next = new Set(data.map((p) => p.id));
        setIds(next);
      }
    } catch {
      setIds(new Set());
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [pathname, refresh]);

  const toggle = useCallback(async (productId: number, onGuest?: () => void) => {
    const token = localStorage.getItem("token");
    if (!token) {
      onGuest?.();
      return;
    }

    const snapshot = new Set(idsRef.current);
    const wasSaved = snapshot.has(productId);
    const optimistic = new Set(snapshot);
    if (wasSaved) optimistic.delete(productId);
    else optimistic.add(productId);

    idsRef.current = optimistic;
    setIds(optimistic);

    try {
      const res = await apiFetch(apiUrl(`/wishlist/${productId}`), {
        method: wasSaved ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        idsRef.current = snapshot;
        setIds(snapshot);
      }
    } catch {
      idsRef.current = snapshot;
      setIds(snapshot);
    }
  }, []);

  return { ids, refresh, toggle };
}
