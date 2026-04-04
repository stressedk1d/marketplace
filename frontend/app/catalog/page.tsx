"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  Suspense,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import Toast from "@/app/components/Toast";
import WishlistHeart from "@/app/components/WishlistHeart";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/useWishlist";

const PAGE_SIZE = 12;

interface BrandBrief {
  id: number;
  name: string;
  slug: string;
}

interface CollectionBrief {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id?: number | null;
  brand?: BrandBrief | null;
  collection?: CollectionBrief | null;
}

interface BrandRow {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
}

interface CollectionRow {
  id: number;
  name: string;
  slug: string;
  brand_id: number | null;
}

interface ProductListResponse {
  items: Product[];
  total: number;
  limit: number;
  offset: number;
}

interface Category {
  id: number;
  name: string;
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "name_asc", label: "Название А→Я" },
  { value: "name_desc", label: "Название Я→А" },
  { value: "price_asc", label: "Цена: по возрастанию" },
  { value: "price_desc", label: "Цена: по убыванию" },
  { value: "popular", label: "Популярные (просмотры)" },
];

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshCart } = useCart();
  const { ids: wishlistIds, toggle: toggleWishlist } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const fetchGenRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const abortFirstRef = useRef<AbortController | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const notify = (text: string, type: "success" | "error") => {
    setToastMessage(text);
    setToastType(type);
  };

  const filterQueryKey = searchParams.toString();

  const buildProductsQuery = useCallback(
    (offset: number) => {
      const params = new URLSearchParams();
      const search = searchParams.get("search");
      if (search) params.set("search", search);
      const categoryId = searchParams.get("category_id");
      if (categoryId) params.set("category_id", categoryId);
      const brandId = searchParams.get("brand_id");
      if (brandId) params.set("brand_id", brandId);
      const collectionId = searchParams.get("collection_id");
      if (collectionId) params.set("collection_id", collectionId);
      const minPrice = searchParams.get("min_price");
      if (minPrice) params.set("min_price", minPrice);
      const maxPrice = searchParams.get("max_price");
      if (maxPrice) params.set("max_price", maxPrice);
      params.set("sort", searchParams.get("sort") ?? "name_asc");
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));
      return `?${params.toString()}`;
    },
    [searchParams]
  );

  const updateCatalogParams = (updates: Record<string, string | null>) => {
    setAiMode(false);
    const p = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") p.delete(key);
      else p.set(key, value);
    }
    if (!p.get("sort")) p.set("sort", "name_asc");
    router.replace(`/catalog?${p.toString()}`);
  };

  const fetchFirstPage = useCallback(async () => {
    const gen = ++fetchGenRef.current;
    abortFirstRef.current?.abort();
    abortFirstRef.current = new AbortController();
    const { signal } = abortFirstRef.current;

    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/products${buildProductsQuery(0)}`), {
        signal,
      });
      if (gen !== fetchGenRef.current) return;
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const detail =
          typeof errBody?.detail === "string"
            ? errBody.detail
            : "Не удалось загрузить каталог";
        notify(detail, "error");
        return;
      }
      const data: ProductListResponse = await res.json();
      if (gen !== fetchGenRef.current) return;
      setProducts(data.items);
      setTotal(data.total);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Ошибка загрузки:", err);
      if (gen === fetchGenRef.current) {
        notify("Ошибка сети при загрузке каталога", "error");
      }
    } finally {
      if (gen === fetchGenRef.current) setLoading(false);
    }
  }, [buildProductsQuery]);

  const loadMore = useCallback(async () => {
    if (aiMode) return;
    if (loading || loadingMoreRef.current) return;
    if (products.length >= total) return;

    const genAtStart = fetchGenRef.current;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const offset = products.length;
      const res = await fetch(apiUrl(`/products${buildProductsQuery(offset)}`));
      if (genAtStart !== fetchGenRef.current) return;
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const detail =
          typeof errBody?.detail === "string"
            ? errBody.detail
            : "Не удалось подгрузить товары";
        notify(detail, "error");
        return;
      }
      const data: ProductListResponse = await res.json();
      if (genAtStart !== fetchGenRef.current) return;
      setProducts((prev) => [...prev, ...data.items]);
    } catch (err) {
      console.error(err);
      if (genAtStart === fetchGenRef.current) {
        notify("Ошибка сети при подгрузке", "error");
      }
    } finally {
      loadingMoreRef.current = false;
      if (genAtStart === fetchGenRef.current) setLoadingMore(false);
    }
  }, [
    aiMode,
    loading,
    products.length,
    total,
    buildProductsQuery,
  ]);

  useEffect(() => {
    fetch(apiUrl("/categories"))
      .then((r) => r.json())
      .then((data: Category[]) =>
        setCategories(Array.isArray(data) ? data : [])
      )
      .catch(() => setCategories([]));
    fetch(apiUrl("/brands"))
      .then((r) => r.json())
      .then((data: BrandRow[]) =>
        setBrands(Array.isArray(data) ? data : [])
      )
      .catch(() => setBrands([]));
    fetch(apiUrl("/collections?exclude_celebrity_brands=true"))
      .then((r) => r.json())
      .then((data: CollectionRow[]) =>
        setCollections(Array.isArray(data) ? data : [])
      )
      .catch(() => setCollections([]));
  }, []);

  useEffect(() => {
    if (aiMode) return;
    void fetchFirstPage();
  }, [filterQueryKey, aiMode, fetchFirstPage]);

  useEffect(() => {
    if (aiMode) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) void loadMore();
      },
      { root: null, rootMargin: "240px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [aiMode, loadMore, products.length, total]);

  const handleReset = () => {
    setAiMode(false);
    router.push("/catalog?sort=name_asc");
  };

  const handlePhotoSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    setIsAiSearching(true);
    try {
      const response = await fetch(apiUrl("/ai/search"), {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const raw: Product[] = await response.json();
        fetchGenRef.current += 1;
        setAiMode(true);
        setProducts(raw);
        setTotal(raw.length);
        notify("ИИ-ассистент подобрал похожие товары!", "success");
      } else {
        notify("Ошибка при анализе фото", "error");
      }
    } catch (error) {
      console.error("AI Search error:", error);
    } finally {
      setIsAiSearching(false);
    }
  };

  const addToCart = async (productId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Войдите в аккаунт, чтобы добавить товар в корзину", "error");
      return;
    }
    try {
      const response = await apiFetch(apiUrl("/cart/add"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      if (response.ok) {
        notify("Товар добавлен в корзину", "success");
        refreshCart();
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") {
        notify("Сессия истекла, войдите снова", "error");
      } else {
        console.error(err);
      }
    }
  };

  const searchTerm = searchParams.get("search");
  const categoryIdParam = searchParams.get("category_id") ?? "";
  const brandIdParam = searchParams.get("brand_id") ?? "";
  const collectionIdParam = searchParams.get("collection_id") ?? "";
  const minPriceParam = searchParams.get("min_price") ?? "";
  const maxPriceParam = searchParams.get("max_price") ?? "";
  const sortParam = searchParams.get("sort") ?? "name_asc";

  const filteredCollections = brandIdParam
    ? collections.filter((c) => String(c.brand_id ?? "") === brandIdParam)
    : collections;

  const shownCount = aiMode ? products.length : total;
  const hasMore = !aiMode && products.length < total;

  if (loading && products.length === 0 && !aiMode) {
    return (
      <div className="text-center mt-10 text20">Загрузка каталога...</div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-main">
        {toastMessage && (
          <div className="mb-4">
            <Toast message={toastMessage} type={toastType} />
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="h32">Каталог</h1>
            {(searchTerm ||
              categoryIdParam ||
              brandIdParam ||
              collectionIdParam ||
              minPriceParam ||
              maxPriceParam ||
              aiMode) && (
              <p className="text16 text-gray-600 mt-1">
                Найдено: {shownCount}
                {searchTerm ? ` по запросу «${searchTerm}»` : ""}
                {aiMode ? " (поиск по фото)" : ""}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="text16 border border-black px-4 py-2 bg-white hover:bg-gray-50"
            >
              Сбросить всё
            </button>
            <label
              className={`cursor-pointer flex items-center gap-2 px-6 py-3 border border-black text16 transition ${
                isAiSearching ? "bg-gray-300" : "bg-black text-white"
              }`}
            >
              <span>{isAiSearching ? "ИИ думает..." : "Поиск по фото"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSearch}
                disabled={isAiSearching}
              />
            </label>
          </div>
        </div>

        {loading && products.length > 0 && !aiMode && (
          <p className="text-center text16 text-gray-500 mb-4" aria-live="polite">
            Обновление списка...
          </p>
        )}

        <div className="mb-8 border border-black/15 bg-white p-4 flex flex-col lg:flex-row flex-wrap gap-4 lg:items-end">
          <label className="flex flex-col gap-1 min-w-[200px]">
            <span className="text16 text-gray-500">Категория</span>
            <select
              className="border border-black/30 px-3 py-2 text16 bg-white"
              value={categoryIdParam}
              onChange={(e) =>
                updateCatalogParams({ category_id: e.target.value || null })
              }
            >
              <option value="">Все</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 min-w-[180px]">
            <span className="text16 text-gray-500">Бренд</span>
            <select
              className="border border-black/30 px-3 py-2 text16 bg-white"
              value={brandIdParam}
              onChange={(e) =>
                updateCatalogParams({
                  brand_id: e.target.value || null,
                  collection_id: null,
                })
              }
            >
              <option value="">Все</option>
              {brands.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 min-w-[200px]">
            <span className="text16 text-gray-500">Коллекция</span>
            <select
              className="border border-black/30 px-3 py-2 text16 bg-white"
              value={collectionIdParam}
              onChange={(e) =>
                updateCatalogParams({ collection_id: e.target.value || null })
              }
            >
              <option value="">Все</option>
              {filteredCollections.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 w-full sm:w-32">
            <span className="text16 text-gray-500">Цена от, ₽</span>
            <input
              type="number"
              min={0}
              step={1}
              placeholder="0"
              className="border border-black/30 px-3 py-2 text16"
              value={minPriceParam}
              onChange={(e) =>
                updateCatalogParams({
                  min_price: e.target.value.trim() || null,
                })
              }
            />
          </label>
          <label className="flex flex-col gap-1 w-full sm:w-32">
            <span className="text16 text-gray-500">Цена до, ₽</span>
            <input
              type="number"
              min={0}
              step={1}
              placeholder="∞"
              className="border border-black/30 px-3 py-2 text16"
              value={maxPriceParam}
              onChange={(e) =>
                updateCatalogParams({
                  max_price: e.target.value.trim() || null,
                })
              }
            />
          </label>
          <label className="flex flex-col gap-1 min-w-[220px] flex-1">
            <span className="text16 text-gray-500">Сортировка</span>
            <select
              className="border border-black/30 px-3 py-2 text16 bg-white"
              value={sortParam}
              onChange={(e) => updateCatalogParams({ sort: e.target.value })}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text20 text-gray-600 mb-4">Ничего не найдено</p>
            <button type="button" onClick={handleReset} className="text16 underline">
              Показать все товары
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="bg-[#d9d9d9] border border-black/10 overflow-hidden text-black flex flex-col"
                >
                  <div className="relative w-full h-64 bg-[#cfcfcf]">
                    <Link href={`/product/${product.id}`} className="block absolute inset-0">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </Link>
                    <div className="absolute top-2 right-2 z-10">
                      <WishlistHeart
                        saved={wishlistIds.has(product.id)}
                        onToggle={() =>
                          void toggleWishlist(product.id, () =>
                            notify("Войдите, чтобы сохранять избранное", "error")
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-[#f3f3f3] flex flex-col flex-1">
                    {product.brand && (
                      <p className="text14 text-gray-500 mb-1">{product.brand.name}</p>
                    )}
                    {product.collection && (
                      <Link
                        href={`/collections/${product.collection.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text14 inline-block mb-2 px-2 py-0.5 border border-black/25 w-fit hover:bg-white/80"
                      >
                        {product.collection.name}
                      </Link>
                    )}
                    <p className="text16 text-black mb-1">{product.price} ₽</p>
                    <Link href={`/product/${product.id}`} className="block mb-1">
                      <h2 className="text16 font-semibold hover:underline line-clamp-2 min-h-[44px]">
                        {product.name}
                      </h2>
                    </Link>
                    <p className="text16 text-gray-500 line-clamp-2 mb-4 flex-1">
                      {product.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => addToCart(product.id)}
                      className="w-full border border-black py-2 text16 bg-white hover:bg-gray-100 transition mt-auto"
                    >
                      В корзину
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {loadingMore && (
              <div className="flex justify-center items-center gap-3 py-10" aria-live="polite">
                <div
                  className="h-8 w-8 border-2 border-black border-t-transparent rounded-full animate-spin shrink-0"
                  aria-hidden
                />
                <span className="text16 text-gray-600">Загрузка...</span>
              </div>
            )}

            {hasMore && (
              <div ref={sentinelRef} className="h-4 w-full" aria-hidden />
            )}

            {!hasMore && !aiMode && products.length > 0 && total > PAGE_SIZE && (
              <p className="text-center text16 text-gray-500 py-6">
                Показаны все товары по выбранным условиям
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center mt-10 text20">Загрузка каталога...</div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
