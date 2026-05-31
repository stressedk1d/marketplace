"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Breadcrumbs from "@/app/components/Breadcrumbs";
import { useToast } from "@/lib/ToastContext";
import { useCart } from "@/lib/CartContext";
import { apiFetch, apiUrl } from "@/lib/api";
import { buildCatalogQuery, getProducts, uploadVisualSearchImage } from "@/lib/catalog-api";
import { useWishlist } from "@/lib/useWishlist";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { getSavedCatalogQuery, saveCatalogQuery } from "@/lib/catalog-filter-storage";
import ActiveFilterChips, {
  buildActiveFilterChips,
} from "@/app/catalog/components/ActiveFilterChips";
import FiltersPanel from "@/app/catalog/components/FiltersPanel";
import Pagination from "@/app/catalog/components/Pagination";
import ProductGrid from "@/app/catalog/components/ProductGrid";
import SortSelector from "@/app/catalog/components/SortSelector";
import VisualSearchModal from "@/app/catalog/components/VisualSearchModal";
import CameraIcon from "@/app/components/icons/CameraIcon";
import ProductGridSkeleton from "@/app/components/ProductGridSkeleton";
import CompareBar from "@/app/components/CompareBar";
import ProductQuickViewModal from "@/app/components/ProductQuickViewModal";
import { PageHero } from "@/app/components/PageHero";
import { catalogStickyBar } from "@/lib/page-classes";
import { getCompareIds, toggleCompare } from "@/lib/compare";
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
    in_stock_only: searchParams.get("in_stock_only") === "true",
    min_rating: searchParams.get("min_rating") ?? "",
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
  const { refreshCart, bumpCart } = useCart();
  const gridAnchorRef = useRef<HTMLDivElement>(null);
  const prevQueryKeyRef = useRef<string | null>(null);
  const { showToast } = useToast();
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
      in_stock_only: false,
      min_rating: "",
    },
    facets: EMPTY_FACETS,
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [visualSearchOpen, setVisualSearchOpen] = useState(false);
  const [visualSearchProducts, setVisualSearchProducts] = useState<Product[] | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [collectionOptions, setCollectionOptions] = useState<{ id: number; name: string }[]>([]);
  const [compareIds, setCompareIds] = useState<Set<number>>(new Set());
  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  const mobileFiltersRef = useRef<HTMLDivElement>(null);

  const requestCacheRef = useRef<Map<string, ProductListResponse>>(new Map());
  const latestRequestRef = useRef(0);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRequestAbortRef = useRef<AbortController | null>(null);

  const currentParams = useMemo(() => {
    const p = new URLSearchParams(searchParams.toString());
    return parseCatalogParams(p);
  }, [searchParams]);

  const currentQueryKey = useMemo(() => buildUrlParams(currentParams).toString(), [currentParams]);

  useEffect(() => {
    if (searchParams.get("openVisualSearch") !== "1") return;
    setVisualSearchOpen(true);
    const next = new URLSearchParams(searchParams.toString());
    next.delete("openVisualSearch");
    const q = next.toString();
    router.replace(q ? `/catalog?${q}` : "/catalog", { scroll: false });
  }, [searchParams, router]);

  const collectionName = useMemo(() => {
    const id = Number(state.filters.collection_id);
    if (!id) return undefined;
    return collectionOptions.find((c) => c.id === id)?.name;
  }, [state.filters.collection_id, collectionOptions]);

  useFocusTrap(mobileFiltersRef, mobileFiltersOpen, () => setMobileFiltersOpen(false));

  useEffect(() => {
    setCompareIds(new Set(getCompareIds()));
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<number[]>).detail;
      setCompareIds(new Set(Array.isArray(detail) ? detail : getCompareIds()));
    };
    window.addEventListener("vw-compare-change", onChange);
    return () => window.removeEventListener("vw-compare-change", onChange);
  }, []);

  useEffect(() => {
    const path = state.filters.brand_slug
      ? `/brands/${encodeURIComponent(state.filters.brand_slug)}/collections`
      : "/collections";
    fetch(apiUrl(path))
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setCollectionOptions(
          Array.isArray(data)
            ? data.map((c: { id: number; name: string }) => ({ id: c.id, name: c.name }))
            : []
        );
      })
      .catch(() => setCollectionOptions([]));
  }, [state.filters.brand_slug]);

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
      saveCatalogQuery(nextQuery);
      router.replace(`/catalog?${nextQuery}`);
    },
    [currentParams, currentQueryKey, router]
  );

  useEffect(() => {
    const bare = !searchParams.toString();
    if (!bare) {
      saveCatalogQuery(searchParams.toString());
      return;
    }
    const saved = getSavedCatalogQuery();
    if (saved) {
      router.replace(`/catalog?${saved}`);
    }
  }, [searchParams, router]);

  const activeFilterChips = useMemo(
    () =>
      buildActiveFilterChips({
        search: state.filters.search,
        brandSlug: state.filters.brand_slug,
        brandName: state.facets.brands.find((b) => b.slug === state.filters.brand_slug)?.name,
        productType: state.filters.product_type,
        minPrice: state.filters.min_price,
        maxPrice: state.filters.max_price,
        collectionId: state.filters.collection_id,
        collectionName,
        inStockOnly: state.filters.in_stock_only,
        minRating: state.filters.min_rating,
        onClearSearch: () => updateUrl({ search: "" }, true),
        onClearBrand: () => updateUrl({ brand_slug: "", collection_id: "" }, true),
        onClearProductType: () => updateUrl({ product_type: "" }, true),
        onClearCollection: () => updateUrl({ collection_id: "" }, true),
        onClearPrice: () => updateUrl({ min_price: "", max_price: "" }, true),
        onClearInStock: () => updateUrl({ in_stock_only: false }, true),
        onClearMinRating: () => updateUrl({ min_rating: "" }, true),
      }),
    [state.filters, state.facets.brands, collectionName, updateUrl]
  );

  const retryLoad = useCallback(() => {
    requestCacheRef.current.delete(currentQueryKey);
    setReloadToken((t) => t + 1);
  }, [currentQueryKey]);

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
            in_stock_only: currentParams.in_stock_only,
            min_rating: currentParams.min_rating,
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
          in_stock_only: currentParams.in_stock_only,
          min_rating: currentParams.min_rating,
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
            in_stock_only: currentParams.in_stock_only,
            min_rating: currentParams.min_rating,
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
  }, [currentParams, currentQueryKey, getCache, hasCache, setCache, reloadToken]);

  useEffect(() => {
    if (currentParams.offset !== 0) return;
    if (prevQueryKeyRef.current !== null && prevQueryKeyRef.current !== currentQueryKey) {
      gridAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    prevQueryKeyRef.current = currentQueryKey;
  }, [currentQueryKey, currentParams.offset]);

  const notify = useCallback(
    (text: string, type: "success" | "error") => {
      showToast(text, type);
    },
    [showToast],
  );

  const handleToggleCompare = useCallback(
    (productId: number) => {
      const result = toggleCompare(productId);
      setCompareIds(new Set(result.ids));
      if (!result.ok && result.reason === "max") {
        notify("Можно сравнить не более 3 товаров", "error");
      }
    },
    [notify]
  );

  const addToCart = useCallback(
    async (productId: number) => {
      const p = state.products.find((x) => x.id === productId);
      if (p?.variants && p.variants.length > 0) {
        notify("Выберите размер на странице товара", "error");
        router.push(`/product/${productId}`);
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) {
        notify("Войдите в аккаунт, чтобы добавить товар в корзину", "error");
        return;
      }
      bumpCart(1);
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
          void refreshCart();
        } else {
          bumpCart(-1);
        }
      } catch (err: unknown) {
        bumpCart(-1);
        if (err instanceof Error && err.message === "SESSION_EXPIRED") {
          notify("Сессия истекла, войдите снова", "error");
        } else {
          notify("Не удалось добавить товар в корзину", "error");
        }
      }
    },
    [notify, refreshCart, bumpCart, state.products, router]
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
        in_stock_only: false,
        min_rating: "",
      },
      true
    );
  }, [updateUrl]);

  return (
    <div className="min-h-screen bg-background pb-10 pt-6 sm:pt-8">
      <div className="container-main space-y-6">
        <Breadcrumbs items={[{ label: "Каталог" }]} />

        <PageHero
          eyebrow="VogueWay"
          title="Каталог"
          description="Современный выбор одежды, обуви и аксессуаров — фильтры по бренду, типу, цене и рейтингу."
          variant="dark"
        >
          <button
            type="button"
            onClick={() => setVisualSearchOpen(true)}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100"
          >
            <CameraIcon className="h-4 w-4" />
            Поиск по фото
          </button>
        </PageHero>

        <div className={catalogStickyBar}>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{displayedCount}</span>
            {" "}из{" "}
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {isVisualSearchMode ? displayedCount : state.total}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
              className={`lg:hidden inline-flex items-center gap-2 ${ui.button.primary}`}
            >
              <CameraIcon className="h-4 w-4" />
              AI-поиск
            </button>
            <SortSelector
              value={state.filters.sort}
              onChange={(value) => updateUrl({ sort: value }, true)}
            />
          </div>
        </div>

        {!isVisualSearchMode && activeFilterChips.length > 0 && (
          <ActiveFilterChips chips={activeFilterChips} />
        )}
        {isVisualSearchMode && (
          <div className="flex items-center gap-2">
            <span className={ui.chip.inverse}>Результаты поиска по фото</span>
            <button
              type="button"
              onClick={() => setVisualSearchProducts(null)}
              className={ui.chip.action}
            >
              Сбросить
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <FiltersPanel
                searchDefaultValue={state.filters.search}
                searchInputKey={state.filters.search}
                brandSlug={state.filters.brand_slug}
                productType={state.filters.product_type}
                minPrice={state.filters.min_price}
                maxPrice={state.filters.max_price}
                collectionId={state.filters.collection_id}
                inStockOnly={state.filters.in_stock_only}
                minRating={state.filters.min_rating}
                facets={state.facets}
                onSearchChange={handleSearchChange}
                onBrandChange={(slug) =>
                  updateUrl(
                    {
                      brand_slug: slug,
                      ...(slug !== state.filters.brand_slug ? { collection_id: "" } : {}),
                    },
                    true
                  )
                }
                onProductTypeChange={(value) => updateUrl({ product_type: value }, true)}
                onCollectionChange={(id) => updateUrl({ collection_id: id }, true)}
                onMinPriceChange={(value) => updateUrl({ min_price: value.trim() }, true)}
                onMaxPriceChange={(value) => updateUrl({ max_price: value.trim() }, true)}
                onPriceRangePick={(min, max) => updateUrl({ min_price: min, max_price: max }, true)}
                onInStockOnlyChange={(value) => updateUrl({ in_stock_only: value }, true)}
                onMinRatingChange={(value) => updateUrl({ min_rating: value }, true)}
                onReset={resetFilters}
              />
            </div>
          </aside>

          <main ref={gridAnchorRef} className="relative scroll-mt-24">
            {state.loading && state.products.length > 0 && !isVisualSearchMode && (
              <div className={ui.overlay.loadingBlur} />
            )}
            {state.loading && (
              <p className={`mb-4 px-4 py-3 text-center text15 ${tokens.color.textMuted} ${ui.card.base}`}>
                Загрузка...
              </p>
            )}

            {state.error && (
              <div
                className={`mb-4 flex flex-col items-center gap-3 ${tokens.radius.lg} border border-red-200 bg-red-50 px-4 py-4 text-center`}
              >
                <p className="text15 text-red-600">{state.error}</p>
                <button type="button" onClick={retryLoad} className={ui.button.secondary}>
                  Повторить
                </button>
              </div>
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
              <div key={currentQueryKey} className={ui.transition.base}>
                <ProductGrid
                  products={displayedProducts}
                  wishlistIds={wishlistIds}
                  compareIds={compareIds}
                  onToggleWishlist={(productId) =>
                    void toggleWishlist(productId, () =>
                      notify("Войдите, чтобы сохранять избранное", "error")
                    )
                  }
                  onAddToCart={(productId) => void addToCart(productId)}
                  onToggleCompare={handleToggleCompare}
                  onQuickView={setQuickViewId}
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
                className={`inline-flex items-center gap-2 ${ui.button.primary}`}
              >
                <CameraIcon className="h-4 w-4" />
                Попробовать поиск по фото
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
            <div ref={mobileFiltersRef} className={`${ui.card.bottomSheet} animate-sheet-in-up`}>
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
                  inStockOnly={state.filters.in_stock_only}
                  minRating={state.filters.min_rating}
                  facets={state.facets}
                  onSearchChange={handleSearchChange}
                  onBrandChange={(slug) =>
                    updateUrl(
                      {
                        brand_slug: slug,
                        ...(slug !== state.filters.brand_slug ? { collection_id: "" } : {}),
                      },
                      true
                    )
                  }
                  onProductTypeChange={(value) => updateUrl({ product_type: value }, true)}
                  onCollectionChange={(id) => updateUrl({ collection_id: id }, true)}
                  onMinPriceChange={(value) => updateUrl({ min_price: value.trim() }, true)}
                  onMaxPriceChange={(value) => updateUrl({ max_price: value.trim() }, true)}
                  onPriceRangePick={(min, max) => updateUrl({ min_price: min, max_price: max }, true)}
                  onInStockOnlyChange={(value) => updateUrl({ in_stock_only: value }, true)}
                  onMinRatingChange={(value) => updateUrl({ min_rating: value }, true)}
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

        <ProductQuickViewModal productId={quickViewId} onClose={() => setQuickViewId(null)} />
        <CompareBar />

        <button
          type="button"
          onClick={() => setVisualSearchOpen(true)}
          className={`${ui.button.fab} inline-flex items-center justify-center`}
          aria-label="Открыть поиск по фото"
        >
          <CameraIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton label="Загрузка каталога" />}>
      <CatalogContent />
    </Suspense>
  );
}
