"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import EmptyState from "@/app/components/EmptyState";
import { PageHero } from "@/app/components/PageHero";
import ProductGridSkeleton from "@/app/components/ProductGridSkeleton";
import { useCart } from "@/lib/CartContext";
import { useToast } from "@/lib/ToastContext";
import type { CatalogBrand } from "@/lib/catalog-types";
import { formatPrice } from "@/lib/format";
import { publicImageSrc } from "@/lib/image-src";
import {
  pageContent,
  pageProductCard,
  pageProductImage,
  pageShell,
} from "@/lib/page-classes";
import { pageOutlineButton } from "@/lib/ui";

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
  "Коллекции и мерч на маркетплейсе VogueWay — эксклюзивные дропы и лимитированные серии.";

export default function CelebrityDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { refreshCart, bumpCart } = useCart();

  const [meta, setMeta] = useState<CatalogBrand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

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
          apiUrl(`/products?brand_slug=${encodeURIComponent(slug)}&limit=50&offset=0`)
        );
        const data: ProductListResponse = await pr.json();
        if (cancelled) return;
        setProducts(Array.isArray(data.items) ? data.items : []);
      } catch {
        if (!cancelled) {
          showToast("Ошибка загрузки. Проверьте соединение.", "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, router, showToast]);

  const addToCart = async (productId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Войдите в аккаунт", "error");
      return;
    }
    bumpCart(1);
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
        showToast("Товар добавлен в корзину", "success");
        void refreshCart();
      } else {
        bumpCart(-1);
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
    <div className={pageShell}>
      <div className={`${pageContent} pt-8 sm:pt-10`}>
        <Breadcrumbs
          items={[
            { label: "Знаменитости", href: "/celebrities" },
            { label: meta?.name ?? slug },
          ]}
        />

        {meta && (
          <PageHero
            eyebrow="Celebrity"
            title={meta.name}
            description={FALLBACK_DESCRIPTION}
            variant="dark"
          >
            <Link
              href="/celebrities"
              className="inline-flex items-center rounded-full border border-white/25 px-4 py-2 text-sm text-white/90 transition hover:bg-white/10"
            >
              ← Все знаменитости
            </Link>
          </PageHero>
        )}

        {loading ? (
          <ProductGridSkeleton
            count={4}
            columns="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            label="Загрузка товаров"
          />
        ) : products.length === 0 ? (
          <EmptyState
            icon="★"
            title="Товары не найдены"
            description="Коллекция пока пуста — загляните позже или перейдите в каталог."
            actionLabel="В каталог"
            actionHref="/catalog"
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <article key={product.id} className={`${pageProductCard} flex flex-col`}>
                <Link href={`/product/${product.id}`} className="block">
                  <div className={`${pageProductImage} aspect-[4/5] w-full overflow-hidden`}>
                    <Image
                      src={publicImageSrc(product.image_url)}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <p className="mb-1 text-sm font-bold">{formatPrice(product.price)}</p>
                  <Link href={`/product/${product.id}`} className="mb-2 block">
                    <h2 className="line-clamp-2 min-h-[40px] text-sm font-semibold transition group-hover:underline">
                      {product.name}
                    </h2>
                  </Link>
                  <p className="mb-3 line-clamp-2 flex-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {product.description}
                  </p>
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
        )}
      </div>
    </div>
  );
}
