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
import Toast from "@/app/components/Toast";
import WishlistHeart from "@/app/components/WishlistHeart";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/useWishlist";

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
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const notify = (text: string, type: "success" | "error") => {
    setToastMessage(text);
    setToastType(type);
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
      <div className="container-main py-10">
        <h1 className="h32 mb-4">Коллекция не найдена</h1>
        <Link href="/catalog" className="underline">
          В каталог
        </Link>
      </div>
    );
  }

  if (loading && products.length === 0 && !notFound) {
    return (
      <div className="text-center mt-10 text20">Загрузка коллекции…</div>
    );
  }

  const hasMore = products.length < total;

  return (
    <div className="min-h-screen py-8 text-black">
      <div className="container-main">
        {toastMessage && (
          <div className="mb-4">
            <Toast message={toastMessage} type={toastType} />
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push("/catalog")}
          className="text16 text-gray-600 hover:text-black mb-4"
        >
          ← Каталог
        </button>

        {meta && (
          <header className="mb-10">
            <p className="text16 text-gray-500 mb-1">
              {meta.brand ? (
                <Link
                  href={
                    meta.brand.is_celebrity
                      ? `/celebrities/${meta.brand.slug}`
                      : `/brands/${meta.brand.slug}`
                  }
                  className="hover:underline"
                >
                  {meta.brand.name}
                </Link>
              ) : (
                "Коллекция"
              )}
            </p>
            <h1 className="h32 mb-2">{meta.name}</h1>
            {meta.description && (
              <p className="text16 text-gray-600 max-w-2xl">{meta.description}</p>
            )}
          </header>
        )}

        {products.length === 0 && !loading ? (
          <p className="text16 text-gray-500">В этой коллекции пока нет товаров.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="bg-[#d9d9d9] border border-black/10 overflow-hidden flex flex-col"
                >
                  <div className="relative w-full h-64 bg-[#cfcfcf]">
                    <Link
                      href={`/product/${product.id}`}
                      className="block absolute inset-0"
                    >
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
                            notify("Войдите для избранного", "error")
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-[#f3f3f3] flex flex-col flex-1">
                    {product.brand && (
                      <p className="text14 text-gray-500 mb-0.5">
                        {product.brand.name}
                      </p>
                    )}
                    {product.collection && (
                      <span className="text14 inline-block mb-1 px-2 py-0.5 border border-black/20 w-fit">
                        {product.collection.name}
                      </span>
                    )}
                    <p className="text16 text-black mb-1">{product.price} ₽</p>
                    <Link href={`/product/${product.id}`} className="block mb-1">
                      <h2 className="text16 font-semibold hover:underline line-clamp-2 min-h-[44px]">
                        {product.name}
                      </h2>
                    </Link>
                    <button
                      type="button"
                      onClick={() => addToCart(product.id)}
                      className="w-full border border-black py-2 text16 bg-white hover:bg-gray-100 mt-auto"
                    >
                      В корзину
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {loadingMore && (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {hasMore && (
              <div ref={sentinelRef} className="h-4" aria-hidden />
            )}
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
