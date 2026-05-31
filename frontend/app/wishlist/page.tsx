"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import ProductGridSkeleton from "@/app/components/ProductGridSkeleton";
import EmptyState from "@/app/components/EmptyState";
import { PageHero } from "@/app/components/PageHero";
import { useCart } from "@/lib/CartContext";
import { useToast } from "@/lib/ToastContext";
import WishlistHeart from "@/app/components/WishlistHeart";
import { useWishlist } from "@/lib/useWishlist";
import { formatPrice } from "@/lib/format";
import { publicImageSrc } from "@/lib/image-src";
import {
  pageContent,
  pageCtaPrimary,
  pageProductCard,
  pageProductImage,
  pageShell,
} from "@/lib/page-classes";
import { pageOutlineButton } from "@/lib/ui";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id?: number | null;
}

export default function WishlistPage() {
  const router = useRouter();
  const { refresh: refreshWishlistIds } = useWishlist();
  const { refreshCart } = useCart();
  const { showToast } = useToast();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [authMissing, setAuthMissing] = useState(false);

  const loadItems = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthMissing(true);
      setItems([]);
      setLoading(false);
      return;
    }
    setAuthMissing(false);
    setLoading(true);
    try {
      const res = await apiFetch(apiUrl("/wishlist"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems(await res.json());
      } else {
        showToast("Не удалось загрузить избранное", "error");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") {
        router.push("/login?reason=session_expired");
      } else {
        showToast("Ошибка сети", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [router, showToast]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const removeItem = async (productId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const snapshot = items;
    setItems((rows) => rows.filter((p) => p.id !== productId));
    try {
      const res = await apiFetch(apiUrl(`/wishlist/${productId}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        void refreshWishlistIds();
        showToast("Убрано из избранного", "info");
      } else {
        setItems(snapshot);
        showToast("Не удалось убрать из избранного", "error");
      }
    } catch {
      setItems(snapshot);
      showToast("Ошибка сети", "error");
    }
  };

  const addToCart = async (productId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      await apiFetch(apiUrl("/cart/add"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      refreshCart();
      showToast("Товар добавлен в корзину", "success");
    } catch {
      showToast("Не удалось добавить в корзину", "error");
    }
  };

  if (loading) {
    return (
      <ProductGridSkeleton
        count={4}
        columns="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        label="Загрузка избранного"
      />
    );
  }

  if (authMissing) {
    return (
      <div className={pageShell}>
        <div className={`${pageContent} pt-8 sm:pt-10`}>
          <PageHero
            eyebrow="Wishlist"
            title="Избранное"
            description="Войдите в аккаунт — сохранённые товары будут доступны на любом устройстве."
            variant="light"
          />
          <div className="mx-auto max-w-md rounded-2xl border border-neutral-200/90 bg-white p-8 text-center shadow-lg dark:border-neutral-700 dark:bg-[var(--surface)]">
            <Link href="/login" className={pageCtaPrimary}>
              Войти в аккаунт
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={pageShell}>
      <div className={`${pageContent} pt-8 sm:pt-10`}>
        <Breadcrumbs items={[{ label: "Избранное" }]} />

        <PageHero
          eyebrow="Wishlist"
          title="Избранное"
          description={
            items.length > 0
              ? `${items.length} ${items.length === 1 ? "товар" : items.length < 5 ? "товара" : "товаров"} — нажмите сердечко на карточке, чтобы убрать.`
              : "Сохраняйте понравившиеся вещи — нажмите сердечко на карточке в каталоге."
          }
          variant="light"
        />

        {items.length === 0 ? (
          <EmptyState
            icon="♡"
            title="Пока пусто"
            description="Сохраняйте понравившиеся товары — нажмите сердечко на карточке в каталоге."
            actionLabel="Перейти в каталог"
            actionHref="/catalog"
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((product) => (
              <article key={product.id} className={pageProductCard}>
                <div className={`${pageProductImage} h-64`}>
                  <Link href={`/product/${product.id}`} className="absolute inset-0 block">
                    {product.image_url && (
                      <Image
                        src={publicImageSrc(product.image_url)}
                        alt={product.name}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, 25vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    )}
                  </Link>
                  <div className="absolute right-2 top-2 z-10">
                    <WishlistHeart
                      saved
                      onToggle={() => void removeItem(product.id)}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="mb-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatPrice(product.price)}
                  </p>
                  <Link href={`/product/${product.id}`} className="mb-2 block">
                    <h2 className="line-clamp-2 min-h-[44px] text-sm font-semibold text-neutral-900 transition group-hover:underline dark:text-neutral-100">
                      {product.name}
                    </h2>
                  </Link>
                  {product.description && (
                    <p className="mb-4 line-clamp-2 flex-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {product.description}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => void addToCart(product.id)}
                    className={`mt-auto w-full ${pageOutlineButton}`}
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
