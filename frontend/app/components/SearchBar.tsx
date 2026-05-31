"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiUrl } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { getRecentSearches, pushRecentSearch } from "@/lib/recent-search";
import { publicImageSrc } from "@/lib/image-src";

interface Suggestion {
  id: number;
  name: string;
  price: number;
  image_url: string;
}

interface SearchBarProps {
  className?: string;
  onNavigate?: () => void;
}

export default function SearchBar({ className = "", onNavigate }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setRecent(getRecentSearches());
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const goSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      pushRecentSearch(trimmed);
      setRecent(getRecentSearches());
      setOpen(false);
      onNavigate?.();
      router.push(`/catalog?search=${encodeURIComponent(trimmed)}`);
    },
    [router, onNavigate]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      fetch(apiUrl(`/products?search=${encodeURIComponent(trimmed)}&limit=5&offset=0`))
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const items = data?.items ?? [];
          setSuggestions(
            items.map((p: Suggestion) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              image_url: p.image_url,
            }))
          );
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 280);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goSearch(query);
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="search"
          placeholder="Поиск"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="min-h-11 flex-1 border border-black px-3 text16 bg-transparent text-black dark:border-white/25 dark:text-[var(--foreground)]"
          autoComplete="off"
          aria-expanded={open}
          aria-controls="search-suggestions"
        />
        <button
          type="submit"
          className="min-h-11 shrink-0 px-4 bg-black text-white text16 inline-flex items-center justify-center"
          aria-label="Искать"
        >
          <Image src="/search-icon.png" alt="" width={16} height={16} aria-hidden />
        </button>
      </form>

      {open && (query.trim().length >= 2 || recent.length > 0) && (
        <div
          id="search-suggestions"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[min(70vh,400px)] overflow-y-auto border border-black/15 bg-white shadow-lg dark:border-white/20 dark:bg-[var(--surface)] dark:shadow-black/40"
        >
          {query.trim().length < 2 && recent.length > 0 && (
            <div className="border-b border-black/10 p-2">
              <p className="px-2 py-1 text12 text-gray-500">Недавние запросы</p>
              {recent.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => goSearch(item)}
                  className="block w-full px-3 py-2 text-left text15 text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-neutral-700"
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {query.trim().length >= 2 && (
            <>
              {loading && (
                <p className="px-4 py-3 text14 text-gray-500">Поиск...</p>
              )}
              {!loading && suggestions.length === 0 && (
                <p className="px-4 py-3 text14 text-gray-500">Ничего не найдено</p>
              )}
              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.id}`}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className="flex items-center gap-3 border-b border-black/5 px-3 py-2 hover:bg-gray-50 last:border-0 dark:border-white/10 dark:hover:bg-neutral-700"
                >
                  <div className="relative h-10 w-10 shrink-0 bg-neutral-100">
                    {item.image_url && (
                      <Image src={publicImageSrc(item.image_url)} alt="" fill unoptimized className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text14 line-clamp-1">{item.name}</p>
                    <p className="text13 text-gray-600">{formatPrice(item.price)}</p>
                  </div>
                </Link>
              ))}
              <button
                type="button"
                onClick={() => goSearch(query)}
                className="w-full px-4 py-3 text-left text14 font-medium text-black hover:bg-gray-50 dark:text-[var(--foreground)] dark:hover:bg-neutral-700"
              >
                Все результаты по «{query.trim()}»
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
