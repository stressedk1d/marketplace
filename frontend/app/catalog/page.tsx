"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Toast from "@/app/components/Toast";
import { useCart } from "@/lib/CartContext";
import { apiFetch, apiUrl } from "@/lib/api";
import { buildCatalogQuery, getProducts, uploadVisualSearchImage } from "@/lib/catalog-api";
import { useWishlist } from "@/lib/useWishlist";
import FiltersPanel from "@/app/catalog/components/FiltersPanel";
import Pagination from "@/app/catalog/components/Pagination";
import ProductGrid from "@/app/catalog/components/ProductGrid";
import SortSelector from "@/app/catalog/components/SortSelector";
import VisualSearchModal from "@/app/catalog/components/VisualSearchModal";
import { ui } from "@/app/catalog/ui/classes";
import { tokens } from "@/app/catalog/ui/tokens";
import {
  CatalogFilters,
  CatalogParams,
  ProductFacets,
  ProductListResponse,
  ProductSort,
  Product,
} from "@/app/catalog/types";

const DEFAULT_LIMIT = 12;
const EMPTY_FACETS: ProductFacets = {
  brands: [],
  product_types: [],
  price_ranges: [],
};

interface CatalogState {
  products: ProductListResponse["items"];
  loading: boolean;
  error: string | null;
  total: number;
  limit: number;
  offset: number;
  filters: CatalogFilters;
  facets: ProductFacets;
}

function parseCatalogParams(searchParams: URLSearchParams): CatalogParams {
  const limitRaw = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);
  const offsetRaw = Number(searchParams.get("offset") ?? 0);

  return {
    search: searchParams.get("search") ?? "",
    brand_slug: searchParams.get("brand_slug") ?? "",
    product_type: searchParams.get("product_type") ?? "",
    min_price: searchParams.get("min_price") ?? "",
    max_price: searchParams.get("max_price") ?? "",
    collection_id: searchParams.get("collection_id") ?? "",
    sort: (searchParams.get("sort") as ProductSort) ?? "name_asc",
    limit: Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : DEFAULT_LIMIT,
    offset: Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0,
  };
}

function buildUrlParams(params: CatalogParams): URLSearchParams {
  const query = new URLSearchParams(buildCatalogQuery(params));
  return query;
}

function CatalogContent() {
  // UI governed by design system (tokens.ts + classes.ts)
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshCart } = useCart();
  const { ids: wishlistIds, toggle: toggleWishlist } = useWishlist();

  const [state, setState] = useState<CatalogState>({
    products: [],
    loading: true,
    error: null,
    total: 0,
    limit: DEFAULT_LIMIT,
    offset: 0,
    filters: {
      search: "",
      brand_slug: "",
      product_type: "",
      min_price: "",
      max_price: "",
      collection_id: "",
      sort: "name_asc",
    },
    facets: EMPTY_FACETS,
  });
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [visualSearchOpen, setVisualSearchOpen] = useState(false);
  const [visualSearchProducts, setVisualSearchProducts] = useState<Product[] | null>(null);

  const requestCacheRef = useRef<Map<string, ProductListResponse>>(new Map());
  const latestRequestRef = useRef(0);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRequestAbortRef = useRef<AbortController | null>(null);

  const currentParams = useMemo(() => {
    const p = new URLSearchParams(searchParams.toString());
    return parseCatalogParams(p);
  }, [searchParams]);

  const currentQueryKey = useMemo(() => buildUrlParams(currentParams).toString(), [currentParams]);

  const hasCache = useCallback((key: string): boolean => {
    return requestCacheRef.current.has(key);
  }, []);

  const getCache = useCallback((key: string): ProductListResponse | undefined => {
    return requestCacheRef.current.get(key);
  }, []);

  const setCache = useCallback((key: string, value: ProductListResponse): void => {
    requestCacheRef.current.set(key, value);
  }, []);

  const updateUrl = useCallback(
    (updates: Partial<CatalogParams>, resetOffset: boolean) => {
      setVisualSearchProducts(null);
      const next: CatalogParams = {
        ...currentParams,
        ...updates,
        offset: resetOffset ? 0 : updates.offset ?? currentParams.offset,
      };
      const nextQuery = buildUrlParams(next).toString();
      if (nextQuery === currentQueryKey) return;
      router.replace(`/catalog?${nextQuery}`);
    },
    [currentParams, currentQueryKey, router]
  );

  useEffect(() => {
    return () => {
      activeRequestAbortRef.current?.abort();
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const requestId = ++latestRequestRef.current;
    activeRequestAbortRef.current?.abort();
    const abortController = new AbortController();
    activeRequestAbortRef.current = abortController;

    const cached = hasCache(currentQueryKey) ? getCache(currentQueryKey) : undefined;

    if (cached) {
      queueMicrotask(() => {
        setState({
          products: cached.items,
          loading: false,
          error: null,
          total: cached.total,
          limit: cached.limit,
          offset: cached.offset,
          facets: cached.facets ?? EMPTY_FACETS,
          filters: {
            search: currentParams.search,
            brand_slug: currentParams.brand_slug,
            product_type: currentParams.product_type,
            min_price: currentParams.min_price,
            max_price: currentParams.max_price,
            collection_id: currentParams.collection_id,
            sort: currentParams.sort,
          },
        });
      });
      return;
    }

    queueMicrotask(() => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        filters: {
          search: currentParams.search,
          brand_slug: currentParams.brand_slug,
          product_type: currentParams.product_type,
          min_price: currentParams.min_price,
          max_price: currentParams.max_price,
          collection_id: currentParams.collection_id,
          sort: currentParams.sort,
        },
        limit: currentParams.limit,
        offset: currentParams.offset,
      }));
    });

    void getProducts(currentParams, abortController.signal)
      .then((data) => {
        if (requestId !== latestRequestRef.current) return;
        setCache(currentQueryKey, data);
        setState({
          products: data.items,
          loading: false,
          error: null,
          total: data.total,
          limit: data.limit,
          offset: data.offset,
          facets: data.facets ?? EMPTY_FACETS,
          filters: {
            search: currentParams.search,
            brand_slug: currentParams.brand_slug,
            product_type: currentParams.product_type,
            min_price: currentParams.min_price,
            max_price: currentParams.max_price,
            collection_id: currentParams.collection_id,
            sort: currentParams.sort,
          },
        });
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) return;
        if (requestId !== latestRequestRef.current) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Ошибка загрузки каталога",
          products: [],
          total: 0,
          facets: EMPTY_FACETS,
        }));
      });
  }, [currentParams, currentQueryKey, getCache, hasCache, setCache]);

  const notify = useCallback((text: string, type: "success" | "error") => {
    setToastMessage(text);
    setToastType(type);
  }, []);

  const addToCart = useCallback(
    async (productId: number) => {
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
          notify("Не удалось добавить товар в корзину", "error");
        }
      }
    },
    [notify, refreshCart]
  );

  const displayedProducts = visualSearchProducts ?? state.products;
  const isVisualSearchMode = visualSearchProducts !== null;
  const displayedCount = displayedProducts.length;

  const handleSearchChange = useCallback(
    (value: string) => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      searchDebounceRef.current = setTimeout(() => {
        const trimmed = value.trim();
        if (trimmed === currentParams.search) return;
        updateUrl({ search: trimmed }, true);
      }, 400);
    },
    [currentParams.search, updateUrl]
  );

  const resetFilters = useCallback(() => {
    updateUrl(
      {
        search: "",
        brand_slug: "",
        product_type: "",
        min_price: "",
        max_price: "",
        collection_id: "",
        sort: "name_asc",
      },
      true
    );
  }, [updateUrl]);

  return (
    <div className="min-h-screen bg-[#f7f7f7] py-6 sm:py-8">
      <div className="container-main">
        {toastMessage && (
          <div className="mb-4">
            <Toast message={toastMessage} type={toastType} />
          </div>
        )}

        <header className={`mb-6 p-4 sm:p-6 ${ui.card.base}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="h32">Каталог</h1>
              <p className="mt-1 text15 text-gray-500 sm:text16">
                Современный выбор товаров по брендам, типам и диапазонам цен
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setVisualSearchOpen(true)}
                className={`hidden lg:inline-flex ${ui.button.primary}`}
              >
                <span className="mr-2" aria-hidden>
                  📷
                </span>
                Поиск по фото
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className={`lg:hidden ${ui.button.secondary}`}
              >
                Фильтры
              </button>
              <button
                type="button"
                onClick={() => setVisualSearchOpen(true)}
                className={`lg:hidden ${ui.button.primary}`}
              >
                <span className="mr-2" aria-hidden>
                  📷
                </span>
                Поиск по фото
              </button>
              <SortSelector
                value={state.filters.sort}
                onChange={(value) => updateUrl({ sort: value }, true)}
              />
            </div>
          </div>
          <p className="mt-4 text14 text-gray-600 sm:text15">
            Показано: <span className="font-semibold text-black">{displayedCount}</span> из{" "}
            <span className="font-semibold text-black">
              {isVisualSearchMode ? displayedCount : state.total}
            </span>
          </p>
          {isVisualSearchMode && (
            <div className="mt-3 flex items-center gap-2">
              <span className={ui.chip.inverse}>
                Результаты поиска по фото
              </span>
              <button
                type="button"
                onClick={() => setVisualSearchProducts(null)}
                className={ui.chip.action}
              >
                Сбросить
              </button>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <FiltersPanel
                searchDefaultValue={state.filters.search}
                searchInputKey={state.filters.search}
                brandSlug={state.filters.brand_slug}
                productType={state.filters.product_type}
                minPrice={state.filters.min_price}
                maxPrice={state.filters.max_price}
                collectionId={state.filters.collection_id}
                facets={state.facets}
                onSearchChange={handleSearchChange}
                onBrandChange={(slug) => updateUrl({ brand_slug: slug }, true)}
                onProductTypeChange={(value) => updateUrl({ product_type: value }, true)}
                onCollectionChange={(value) => updateUrl({ collection_id: value.trim() }, true)}
                onMinPriceChange={(value) => updateUrl({ min_price: value.trim() }, true)}
                onMaxPriceChange={(value) => updateUrl({ max_price: value.trim() }, true)}
                onPriceRangePick={(min, max) => updateUrl({ min_price: min, max_price: max }, true)}
                onReset={resetFilters}
              />
            </div>
          </aside>

          <main className="relative">
            {state.loading && state.products.length > 0 && !isVisualSearchMode && (
              <div className={ui.overlay.loadingBlur} />
            )}
            {state.loading && (
              <p className={`mb-4 px-4 py-3 text-center text15 ${tokens.color.textMuted} ${ui.card.base}`}>
                Загрузка...
              </p>
            )}

            {state.error && (
              <p className={`mb-4 ${tokens.radius.lg} border border-red-200 bg-red-50 px-4 py-3 text-center text15 text-red-600`}>
                {state.error}
              </p>
            )}

            {state.loading && state.products.length === 0 && !isVisualSearchMode ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`overflow-hidden ${ui.card.base}`}
                  >
                    <div className="aspect-[4/5] animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                    <div className="space-y-2 p-3 sm:p-4">
                      <div className="h-3 w-2/5 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-3/5 animate-pulse rounded bg-gray-200" />
                      <div className="h-5 w-1/3 animate-pulse rounded bg-gray-300" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={ui.transition.base}>
                <ProductGrid
                  products={displayedProducts}
                  wishlistIds={wishlistIds}
                  onToggleWishlist={(productId) =>
                    void toggleWishlist(productId, () =>
                      notify("Войдите, чтобы сохранять избранное", "error")
                    )
                  }
                  onAddToCart={(productId) => void addToCart(productId)}
                />
              </div>
            )}

            {!isVisualSearchMode && (
              <Pagination
                total={state.total}
                limit={state.limit}
                offset={state.offset}
                onPageChange={(nextOffset) => updateUrl({ offset: nextOffset }, false)}
              />
            )}
          </main>
        </div>

        {!state.loading && !state.error && displayedProducts.length === 0 && (
            <div className={`mt-6 p-6 text-center ${ui.card.base}`}>
            <p className="text18 font-semibold">
              {isVisualSearchMode ? "Похожие товары не найдены" : "Мы не нашли товары"}
            </p>
            <p className="mt-2 text14 text-gray-500">
              {isVisualSearchMode
                ? "Попробуйте загрузить другое фото или сбросьте фильтры"
                : "Попробуйте изменить фильтры или используйте поиск по фото"}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setVisualSearchOpen(true)}
                className={ui.button.primary}
              >
                📷 Попробовать поиск по фото
              </button>
              {isVisualSearchMode && (
                <button
                  type="button"
                  onClick={() => {
                    setVisualSearchProducts(null);
                    resetFilters();
                  }}
                  className={ui.button.secondary}
                >
                  Сбросить фильтры
                </button>
              )}
            </div>
          </div>
        )}

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <button
              type="button"
              className={ui.overlay.backdrop}
              onClick={() => setMobileFiltersOpen(false)}
              aria-label="Закрыть фильтры"
            />
            <div className={ui.card.bottomSheet}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="px-4 pt-4 text18 font-semibold">Фильтры</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className={`mr-4 mt-4 ${ui.button.secondary}`}
                >
                  Закрыть
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <FiltersPanel
                  searchDefaultValue={state.filters.search}
                  searchInputKey={state.filters.search}
                  brandSlug={state.filters.brand_slug}
                  productType={state.filters.product_type}
                  minPrice={state.filters.min_price}
                  maxPrice={state.filters.max_price}
                  collectionId={state.filters.collection_id}
                  facets={state.facets}
                  onSearchChange={handleSearchChange}
                  onBrandChange={(slug) => updateUrl({ brand_slug: slug }, true)}
                  onProductTypeChange={(value) => updateUrl({ product_type: value }, true)}
                  onCollectionChange={(value) => updateUrl({ collection_id: value.trim() }, true)}
                  onMinPriceChange={(value) => updateUrl({ min_price: value.trim() }, true)}
                  onMaxPriceChange={(value) => updateUrl({ max_price: value.trim() }, true)}
                  onPriceRangePick={(min, max) => updateUrl({ min_price: min, max_price: max }, true)}
                  onReset={resetFilters}
                />
              </div>
              <div className={ui.layout.stickyFooter}>
                <button
                  type="button"
                  onClick={resetFilters}
                  className={`flex-1 ${ui.button.secondary}`}
                >
                  Сбросить
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className={`flex-1 ${ui.button.primary}`}
                >
                  Применить
                </button>
              </div>
            </div>
          </div>
        )}

        {visualSearchOpen && (
          <VisualSearchModal
            open={visualSearchOpen}
            onClose={() => setVisualSearchOpen(false)}
            onSearch={async (file) => {
              const { product_ids, products } = await uploadVisualSearchImage(file);
              if (product_ids.length === 0) {
                return { product_ids };
              }
              setVisualSearchProducts(products);
              notify("Найдены похожие товары", "success");
              return { product_ids };
            }}
          />
        )}

        <button
          type="button"
          onClick={() => setVisualSearchOpen(true)}
          className={ui.button.fab}
          aria-label="Открыть поиск по фото"
        >
          <span aria-hidden>📷</span>
        </button>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10 text20">Загрузка каталога...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
