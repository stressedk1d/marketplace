"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import Toast from "@/app/components/Toast";
import { useCart } from "@/lib/CartContext";
import type { CatalogBrand } from "@/lib/catalog-types";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

interface ProductListResponse {
  items: Product[];
  total: number;
  limit: number;
  offset: number;
}

const FALLBACK_DESCRIPTION =
  "Коллекции и мерч на маркетплейсе VogueWay (демо).";

export default function CelebrityDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { refreshCart } = useCart();

  const [meta, setMeta] = useState<CatalogBrand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const slug = Array.isArray(params?.slug) ? params.slug[0] : (params?.slug ?? "");

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setMeta(null);
    setProducts([]);

    (async () => {
      try {
        const br = await fetch(apiUrl("/brands?is_celebrity=true"));
        const brands: CatalogBrand[] = await br.json();
        if (cancelled) return;
        const found = Array.isArray(brands)
          ? brands.find((b) => b.slug === slug)
          : undefined;
        if (!found) {
          router.replace("/celebrities");
          return;
        }
        setMeta(found);

        const pr = await fetch(
          apiUrl(
            `/products?brand_slug=${encodeURIComponent(slug)}&limit=50&offset=0`
          )
        );
        const data: ProductListResponse = await pr.json();
        if (cancelled) return;
        setProducts(Array.isArray(data.items) ? data.items : []);
      } catch {
        if (!cancelled) {
          setToast("Ошибка загрузки. Проверьте соединение.");
          setToastType("error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, router]);

  const addToCart = async (productId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setToast("Войдите в аккаунт");
      setToastType("error");
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
        setToast("Товар добавлен в корзину");
        setToastType("success");
        refreshCart();
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") {
        router.push("/login?reason=session_expired");
      }
    }
  };

  if (!slug) return null;
  if (!loading && !meta) return null;

  return (
    <div className="min-h-screen py-8">
      <div className="container-main text-black">
        {toast && (
          <div className="mb-4">
            <Toast message={toast} type={toastType} />
          </div>
        )}

        {meta && (
          <div className="mb-10 flex items-center gap-6 border border-black/10 bg-[#f3f3f3] p-6">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden border border-black/10 bg-[#d9d9d9]">
              {meta.logo_url ? (
                <Image
                  src={meta.logo_url}
                  alt={meta.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-400">
                  {meta.name.slice(0, 1)}
                </span>
              )}
            </div>
            <div>
              <h1 className="h32 mb-1">{meta.name}</h1>
              <p className="text16 text-gray-500">{FALLBACK_DESCRIPTION}</p>
              <Link
                href="/celebrities"
                className="mt-1 inline-block text16 text-gray-400 hover:underline"
              >
                ← Все знаменитости
              </Link>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center text20">Загрузка...</p>
        ) : products.length === 0 ? (
          <p className="text-center text20 text-gray-500">Товары не найдены</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="flex flex-col overflow-hidden border border-black/10 bg-[#d9d9d9] text-black"
              >
                <Link href={`/product/${product.id}`} className="block">
                  <div className="relative h-64 w-full bg-[#cfcfcf]">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                </Link>
                <div className="flex flex-1 flex-col bg-[#f3f3f3] p-4">
                  <p className="mb-1 text16 text-black">{product.price} ₽</p>
                  <Link href={`/product/${product.id}`} className="mb-1 block">
                    <h2 className="line-clamp-2 min-h-[44px] text16 font-semibold hover:underline">
                      {product.name}
                    </h2>
                  </Link>
                  <p className="mb-4 line-clamp-2 flex-1 text16 text-gray-500">
                    {product.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => addToCart(product.id)}
                    className="mt-auto w-full border border-black bg-white py-2 text16 transition hover:bg-gray-100"
                  >
                    В корзину
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
