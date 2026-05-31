"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import CheckoutSteps from "@/app/components/CheckoutSteps";
import EmptyState from "@/app/components/EmptyState";
import { PageHero } from "@/app/components/PageHero";
import { OrdersPageSkeleton } from "@/app/components/ProductGridSkeleton";
import { formatPrice } from "@/lib/format";
import { publicImageSrc } from "@/lib/image-src";
import OrderStatusTimeline from "@/app/components/OrderStatusTimeline";
import { pageContent, pageShell } from "@/lib/page-classes";
import { formatDeliveryLines, parseOrderDelivery } from "@/lib/order-delivery";

type OrderStatus = "created" | "paid" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
  id: number;
  product_id: number;
  name: string | null;
  image_url: string | null;
  quantity: number;
  price_at_purchase: number;
  size?: string;
}

interface Order {
  id: number;
  status: OrderStatus;
  total_amount: number;
  discount_amount?: number;
  promo_code?: string | null;
  comment?: string | null;
  created_at: string | null;
  items: OrderItem[];
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  created: "Оформлен",
  paid: "Оплачен",
  shipped: "Отправлен",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  created: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  shipped: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  delivered: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authMissing, setAuthMissing] = useState(false);

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthMissing(true);
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch(apiUrl("/orders/my"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: Order[] = await res.json();
        setOrders(data);
      } else {
        setError("Не удалось загрузить заказы");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") {
        router.push("/login?reason=session_expired");
      } else {
        setError("Ошибка соединения с сервером");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  if (loading) return <OrdersPageSkeleton />;

  if (authMissing) {
    return (
      <div className={pageShell}>
        <div className={`${pageContent} pt-8 sm:pt-10`}>
          <PageHero
            eyebrow="Orders"
            title="Мои заказы"
            description="Войдите в аккаунт, чтобы видеть историю покупок и статус доставки."
            variant="light"
          />
          <div className="mx-auto max-w-md rounded-2xl border border-neutral-200/90 bg-white p-8 text-center shadow-lg dark:border-neutral-700 dark:bg-[var(--surface)]">
            <Link
              href="/login"
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-neutral-950 px-6 text-base font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
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
        <Breadcrumbs items={[{ label: "Мои заказы" }]} />
        {orders.length > 0 && <CheckoutSteps current="done" />}

        <PageHero
          eyebrow="Orders"
          title="Мои заказы"
          description={
            orders.length > 0
              ? "Отслеживайте статус доставки и просматривайте состав каждого заказа."
              : "Здесь появится история ваших покупок после первого заказа."
          }
          variant="light"
        />

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        {orders.length === 0 && !error ? (
          <EmptyState
            icon="📦"
            title="Заказов пока нет"
            description="Оформите первый заказ — история появится здесь."
            actionLabel="Перейти в каталог"
            actionHref="/catalog"
          />
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const delivery = parseOrderDelivery(order.comment);
              const deliveryLines = delivery ? formatDeliveryLines(delivery) : [];
              return (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm ring-1 ring-black/[0.04] dark:border-neutral-700 dark:bg-[var(--surface)] dark:ring-white/[0.06]"
              >
                <div className="flex flex-col gap-4 border-b border-neutral-200/80 p-5 dark:border-neutral-700 sm:p-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                          Заказ #{order.id}
                        </h2>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[order.status]}`}
                        >
                          {STATUS_LABELS[order.status]}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString("ru-RU")
                          : "Дата недоступна"}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                        {formatPrice(order.total_amount)}
                      </p>
                      {(order.discount_amount ?? 0) > 0 && (
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
                          Скидка: −{formatPrice(order.discount_amount!)}
                          {order.promo_code ? ` (${order.promo_code})` : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  <OrderStatusTimeline status={order.status} />

                  {deliveryLines.length > 0 && (
                    <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-4 text-sm dark:border-neutral-700 dark:bg-neutral-900/40">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
                        Доставка
                      </p>
                      {deliveryLines.map((line) => (
                        <p key={line} className="text-neutral-700 dark:text-neutral-300">
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-900/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-800">
                          {item.image_url && (
                            <Image
                              src={publicImageSrc(item.image_url)}
                              alt={item.name ?? "Товар"}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {item.name ?? "Товар удалён"}
                          </p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {item.quantity} × {formatPrice(item.price_at_purchase)}
                            {item.size ? ` · размер ${item.size}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 font-semibold text-neutral-900 dark:text-neutral-100">
                        {formatPrice(item.quantity * item.price_at_purchase)}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
