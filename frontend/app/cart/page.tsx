"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import CheckoutSteps from "@/app/components/CheckoutSteps";
import { DeliveryProgress } from "@/app/components/DeliveryProgress";
import EmptyState from "@/app/components/EmptyState";
import GuestAuthBanner from "@/app/components/GuestAuthBanner";
import { PageHero } from "@/app/components/PageHero";
import { SuggestedProducts } from "@/app/components/SuggestedProducts";
import { CartPageSkeleton } from "@/app/components/ProductGridSkeleton";
import { useCart } from "@/lib/CartContext";
import { useToast } from "@/lib/ToastContext";
import { useWishlist } from "@/lib/useWishlist";
import { formatPrice } from "@/lib/format";
import { publicImageSrc } from "@/lib/image-src";
import {
  pageCartLineItem,
  pageCtaPrimary,
  pageContent,
  pageQtyButton,
  pageShell,
  pageSummaryCard,
} from "@/lib/page-classes";
import { pageCardPadded, pageOutlineButton } from "@/lib/ui";

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  size?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  description: string;
}

interface ProductListResponse {
  items: Product[];
  total: number;
  limit: number;
  offset: number;
}

export default function CartPage() {
  const router = useRouter();
  const { refreshCart, bumpCart } = useCart();
  const [isGuest, setIsGuest] = useState(true);
  const { showToast } = useToast();
  const { toggle: toggleWishlist } = useWishlist();
  const [items, setItems] = useState<CartItem[]>([]);
  const [payMethod, setPayMethod] = useState<"pickup" | "online">("pickup");
  const [suggested, setSuggested] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const notify = (text: string, type: "success" | "error" | "info" = "info") => {
    showToast(text, type);
  };

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch(apiUrl("/cart"), { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setItems(await res.json());
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") {
        router.push("/login?reason=session_expired");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsGuest(!localStorage.getItem("token"));
    fetchCart();
    fetch(apiUrl("/products?limit=50&offset=0"))
      .then((r) => r.json())
      .then((data: ProductListResponse) => setSuggested(data.items.slice(0, 6)))
      .catch(() => {});
  }, []);

  const restoreCartItem = async (productId: number, quantity: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await apiFetch(apiUrl("/cart/add"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      await fetchCart();
      notify("Товар возвращён в корзину", "success");
    } catch {
      notify("Не удалось вернуть товар", "error");
    }
  };

  const removeItem = async (item: CartItem) => {
    const token = localStorage.getItem("token");
    const snapshot = { product_id: item.product_id, quantity: item.quantity, name: item.name };
    try {
      const res = await apiFetch(apiUrl(`/cart/${item.id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        refreshCart();
        showToast(`«${snapshot.name}» удалён`, "info", {
          durationMs: 5500,
          action: {
            label: "Отменить",
            onClick: () => void restoreCartItem(snapshot.product_id, snapshot.quantity),
          },
        });
      } else {
        notify("Не удалось удалить товар", "error");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") router.push("/login?reason=session_expired");
    }
  };

  const updateQuantity = async (id: number, newQty: number) => {
    const token = localStorage.getItem("token");
    const item = items.find((i) => i.id === id);
    if (newQty <= 0 && item) {
      await removeItem(item);
      return;
    }
    try {
      const res = await apiFetch(apiUrl(`/cart/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ quantity: newQty }),
      });
      if (res.ok) {
        setItems(items.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)));
        refreshCart();
      } else {
        notify("Не удалось обновить количество", "error");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") router.push("/login?reason=session_expired");
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      bumpCart(1);
      refreshCart();
      notify("Товар добавлен в корзину", "success");
    } catch {
      /* ignore */
    }
  };

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (loading) return <CartPageSkeleton />;

  return (
    <div className={pageShell}>
      <div className={`${pageContent} pt-8 sm:pt-10`}>
        <Breadcrumbs items={[{ label: "Корзина" }]} />
        {isGuest && (
          <GuestAuthBanner message="Войдите в аккаунт, чтобы сохранить корзину и оформить заказ." />
        )}

        <PageHero
          eyebrow="Покупки"
          title="Корзина"
          description={
            items.length > 0
              ? `${totalCount} ${totalCount === 1 ? "товар" : totalCount < 5 ? "товара" : "товаров"} · ${formatPrice(totalPrice)}`
              : "Добавьте товары из каталога — оформление займёт пару минут."
          }
          variant="light"
        />

        {items.length > 0 && <CheckoutSteps current="cart" />}

        {items.length === 0 ? (
          <>
            <EmptyState
              icon="🛒"
              title="В корзине пока пусто"
              description="Загляните в каталог — там товары, которые могут вам понравиться."
              actionLabel="Перейти в каталог"
              actionHref="/catalog"
            />
            <SuggestedProducts
              title="Подобрали для вас"
              products={suggested}
              onAddToCart={(id) => void addToCart(id)}
            />
          </>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => (
                <article key={item.id} className={pageCartLineItem}>
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-800">
                    <Image
                      src={publicImageSrc(item.image_url)}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <div>
                        <Link
                          href={`/product/${item.product_id}`}
                          className="line-clamp-2 font-semibold text-neutral-900 hover:underline dark:text-neutral-100"
                        >
                          {item.name}
                        </Link>
                        {item.size ? (
                          <p className="mt-0.5 text-sm text-neutral-500">Размер: {item.size}</p>
                        ) : null}
                      </div>
                      <p className="shrink-0 font-semibold">{formatPrice(item.price)}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className={pageQtyButton}
                        aria-label="Уменьшить"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className={pageQtyButton}
                        aria-label="Увеличить"
                      >
                        +
                      </button>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const token = localStorage.getItem("token");
                          if (!token) {
                            router.push("/login");
                            return;
                          }
                          void toggleWishlist(item.product_id);
                          notify("Добавлено в избранное", "success");
                        }}
                        className="text-neutral-400 transition hover:text-neutral-900 dark:hover:text-white"
                        aria-label="В избранное"
                      >
                        <Image src="/add-to-favorites.png" alt="" width={16} height={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeItem(item)}
                        className="text-sm text-neutral-500 transition hover:text-red-600"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              <div className={pageCardPadded}>
                <h2 className="text-lg font-semibold">Доставка в пункт выдачи</h2>
                <p className="mt-1 text-sm text-neutral-500">Москва и регионы · бесплатно от 5 000 ₽</p>
                <p className="mt-2 font-medium text-emerald-700 dark:text-emerald-400">VogueWay Delivery</p>
              </div>
            </div>

            <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
              <DeliveryProgress subtotal={totalPrice} />

              <div className={pageSummaryCard}>
                <h2 className="text-lg font-semibold">Итого</h2>
                <p className="mt-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Способ оплаты
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPayMethod("pickup")}
                    className={`flex-1 rounded-full py-2 text-sm ${
                      payMethod === "pickup"
                        ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                        : pageOutlineButton
                    }`}
                  >
                    При получении
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod("online")}
                    className={`flex-1 rounded-full py-2 text-sm ${
                      payMethod === "online"
                        ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                        : pageOutlineButton
                    }`}
                  >
                    Сразу
                  </button>
                </div>

                <div className="mt-5 space-y-2 border-t border-neutral-200 pt-4 dark:border-neutral-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Товары, {totalCount} шт.</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>К оплате</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/checkout")}
                  className={`mt-5 ${pageCtaPrimary}`}
                >
                  Оформить заказ
                </button>
                <p className="mt-3 text-center text-xs text-neutral-400">
                  Нажимая кнопку, вы соглашаетесь с условиями сервиса
                </p>
              </div>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <SuggestedProducts
            title="С этим товаром покупают"
            products={suggested}
            onAddToCart={(id) => void addToCart(id)}
          />
        )}
      </div>
    </div>
  );
}
