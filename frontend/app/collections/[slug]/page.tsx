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
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import EmptyState from "@/app/components/EmptyState";
import { PageHero } from "@/app/components/PageHero";
import ProductGridSkeleton from "@/app/components/ProductGridSkeleton";
import { formatPrice } from "@/lib/format";
import WishlistHeart from "@/app/components/WishlistHeart";
import { useCart } from "@/lib/CartContext";
import { useToast } from "@/lib/ToastContext";
import { useWishlist } from "@/lib/useWishlist";
import { publicImageSrc } from "@/lib/image-src";
import {
  pageContent,
  pageProductCard,
  pageProductImage,
  pageShell,
} from "@/lib/page-classes";
import { pageOutlineButton } from "@/lib/ui";

const PAGE_SIZE = 12;

interface BrandBrief {
  id: number;
  name: string;
  slug: string;
  is_celebrity?: boolean;
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
  brand?: BrandBrief | null;
  collection?: CollectionBrief | null;
}

interface ProductListResponse {
  items: Product[];
  total: number;
  limit: number;
  offset: number;
}

interface CollectionMeta {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  brand_id: number | null;
  is_featured: boolean;
  brand: BrandBrief | null;
}

function CollectionContent() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug ?? "";
  const { refreshCart } = useCart();
  const { ids: wishlistIds, toggle: toggleWishlist } = useWishlist();

  const [meta, setMeta] = useState<CollectionMeta | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { showToast } = useToast();

  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const notify = (text: string, type: "success" | "error") => {
    showToast(text, type);
  };

  const buildQuery = useCallback(
    (offset: number) => {
      const p = new URLSearchParams();
      const search = searchParams.get("search");
      if (search) p.set("search", search);
      const minP = searchParams.get("min_price");
      if (minP) p.set("min_price", minP);
      const maxP = searchParams.get("max_price");
      if (maxP) p.set("max_price", maxP);
      p.set("sort", searchParams.get("sort") ?? "name_asc");
      p.set("limit", String(PAGE_SIZE));
      p.set("offset", String(offset));
      return p.toString();
    },
    [searchParams]
  );

  const filterKey = `${slug}|${searchParams.toString()}`;

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setProducts([]);
    setTotal(0);

    (async () => {
      try {
        const mr = await fetch(apiUrl(`/collections/${slug}`));
        if (!mr.ok) {
          if (!cancelled) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }
        const m: CollectionMeta = await mr.json();
        if (cancelled) return;
        setMeta(m);

        const pr = await fetch(
          apiUrl(`/collections/${slug}/products?${buildQuery(0)}`)
        );
        if (!pr.ok) {
          if (!cancelled) setNotFound(true);
          return;
        }
        const data: ProductListResponse = await pr.json();
        if (cancelled) return;
        setProducts(data.items);
        setTotal(data.total);
      } catch {
        if (!cancelled) notify("Ошибка загрузки", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, filterKey, buildQuery]);

  const loadMore = useCallback(async () => {
    if (!slug || loading || loadingMoreRef.current || products.length >= total) {
      return;
    }
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const offset = products.length;
      const res = await fetch(
        apiUrl(`/collections/${slug}/products?${buildQuery(offset)}`)
      );
      if (res.ok) {
        const data: ProductListResponse = await res.json();
        setProducts((prev) => [...prev, ...data.items]);
      }
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [slug, loading, products.length, total, buildQuery]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || notFound) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "200px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore, notFound, products.length, total]);

  const addToCart = async (productId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Войдите в аккаунт", "error");
      return;
    }
    try {
      const res = await apiFetch(apiUrl("/cart/add"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      if (res.ok) {
        notify("В корзину", "success");
        refreshCart();
      }
    } catch {
      notify("Ошибка", "error");
    }
  };

  if (notFound) {
    return (
      <div className={pageShell}>
        <div className={`${pageContent} pt-8 sm:pt-10`}>
          <EmptyState
            icon="◇"
            title="Коллекция не найдена"
            description="Возможно, ссылка устарела или коллекция была удалена."
            actionLabel="В каталог"
            actionHref="/catalog"
          />
        </div>
      </div>
    );
  }

  if (loading && products.length === 0 && !notFound) {
    return (
      <ProductGridSkeleton
        count={8}
        columns="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        label="Загрузка коллекции"
      />
    );
  }

  const hasMore = products.length < total;

  return (
    <div className={pageShell}>
      <div className={`${pageContent} pt-8 sm:pt-10`}>
        <Breadcrumbs
          items={[
            { label: "Каталог", href: "/catalog" },
            ...(meta?.brand
              ? [
                  {
                    label: meta.brand.name,
                    href: meta.brand.is_celebrity
                      ? `/celebrities/${meta.brand.slug}`
                      : `/brands/${meta.brand.slug}`,
                  },
                ]
              : []),
            { label: meta?.name ?? slug },
          ]}
        />

        {meta && (
          <PageHero
            eyebrow={meta.brand?.name ?? "Collection"}
            title={meta.name}
            description={meta.description ?? "Товары коллекции — добавляйте в корзину и избранное."}
            variant="light"
          />
        )}

        {products.length === 0 && !loading ? (
          <EmptyState
            icon="◇"
            title="Коллекция пуста"
            description="Товары скоро появятся — загляните в каталог."
            actionLabel="В каталог"
            actionHref="/catalog"
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <article key={product.id} className={`${pageProductCard} flex flex-col`}>
                  <div className={`${pageProductImage} aspect-[4/5] w-full overflow-hidden`}>
                    <Link href={`/product/${product.id}`} className="absolute inset-0 block">
                      <Image
                        src={publicImageSrc(product.image_url)}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    </Link>
                    <div className="absolute right-2 top-2 z-10">
                      <WishlistHeart
                        saved={wishlistIds.has(product.id)}
                        onToggle={() =>
                          void toggleWishlist(product.id, () =>
                            notify("Войдите для избранного", "error")
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    {product.brand && (
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
                        {product.brand.name}
                      </p>
                    )}
                    <p className="mb-1 text-sm font-bold">{formatPrice(product.price)}</p>
                    <Link href={`/product/${product.id}`} className="mb-2 block">
                      <h2 className="line-clamp-2 min-h-[40px] text-sm font-semibold transition group-hover:underline">
                        {product.name}
                      </h2>
                    </Link>
                    <button
                      type="button"
                      onClick={() => addToCart(product.id)}
                      className={`mt-auto ${pageOutlineButton} !min-h-[36px] !text-xs`}
                    >
                      В корзину
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {loadingMore && (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-600 dark:border-t-white" />
              </div>
            )}
            {hasMore && <div ref={sentinelRef} className="h-4" aria-hidden />}
          </>
        )}
      </div>
    </div>
  );
}

export default function CollectionProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center mt-10 text20">Загрузка…</div>
      }
    >
      <CollectionContent />
    </Suspense>
  );
}
