"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import Toast from "@/app/components/Toast";

type OrderStatus = "created" | "paid" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
  id: number;
  product_id: number;
  name: string | null;
  image_url: string | null;
  quantity: number;
  price_at_purchase: number;
}

interface Order {
  id: number;
  status: OrderStatus;
  total_amount: number;
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

const PIPELINE: OrderStatus[] = ["created", "paid", "shipped", "delivered"];

function StatusProgress({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <p className="text-red-700 text16 font-medium mt-1">Заказ отменён</p>
    );
  }
  const activeIdx = PIPELINE.indexOf(status);
  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2" aria-label="Этапы заказа">
      {PIPELINE.map((step, i) => (
        <span key={step} className="flex items-center gap-1 sm:gap-2">
          {i > 0 && <span className="text-gray-400 text16 hidden sm:inline">—</span>}
          <span
            className={`text14 sm:text16 px-2 py-1 border whitespace-nowrap ${
              i <= activeIdx
                ? "border-black bg-black text-white"
                : "border-gray-300 text-gray-400 bg-white"
            }`}
          >
            {STATUS_LABELS[step]}
          </span>
        </span>
      ))}
    </div>
  );
}

function demoActions(status: OrderStatus): { label: string; next: OrderStatus }[] {
  switch (status) {
    case "created":
      return [
        { label: "Оплачен (демо)", next: "paid" },
        { label: "Отменить", next: "cancelled" },
      ];
    case "paid":
      return [
        { label: "Отправлен (демо)", next: "shipped" },
        { label: "Отменить", next: "cancelled" },
      ];
    case "shipped":
      return [{ label: "Доставлен (демо)", next: "delivered" }];
    default:
      return [];
  }
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [authMissing, setAuthMissing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  const patchOrderStatus = async (orderId: number, next: OrderStatus) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setUpdatingId(orderId);
    setToast("");
    try {
      const res = await apiFetch(apiUrl(`/orders/${orderId}/status`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail =
          typeof data?.detail === "string"
            ? data.detail
            : "Не удалось обновить статус";
        setToast(detail);
        setToastType("error");
        return;
      }
      const updated = data as Order;
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o))
      );
      setToast("Статус обновлён");
      setToastType("success");
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") {
        router.push("/login?reason=session_expired");
      } else {
        setToast("Ошибка сети");
        setToastType("error");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10 text20">Загрузка заказов...</div>
    );
  }

  if (authMissing) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-main max-w-3xl bg-white p-8 border border-black/20 text-center">
          <h1 className="h32 mb-3">История заказов</h1>
          <p className="text20 mb-4">
            Для просмотра заказов нужно войти в аккаунт.
          </p>
          <Link href="/login" className="text20 underline">
            Перейти ко входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-main text-black">
        <h1 className="h32 mb-2">Мои заказы</h1>
        <p className="text16 text-gray-600 mb-6 max-w-2xl">
          Демо: владелец заказа может вручную переводить статусы (имитация оплаты и
          доставки). В продакшене это делали бы платёж, админка и служба доставки.
        </p>

        {error && (
          <div className="mb-4">
            <Toast message={error} type="error" />
          </div>
        )}
        {toast && (
          <div className="mb-4">
            <Toast message={toast} type={toastType} />
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white p-8 border border-black/20 text-center">
            <p className="text20 mb-4">У вас пока нет заказов.</p>
            <Link href="/catalog" className="text20 underline">
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <article
                key={order.id}
                className="bg-white border border-black/20"
              >
                <div className="p-5 border-b border-black/10 flex flex-col gap-3">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                    <div>
                      <h2 className="text20 font-semibold">Заказ #{order.id}</h2>
                      <p className="text16 text-gray-600">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString("ru-RU")
                          : "Дата недоступна"}
                      </p>
                      <p className="text16 mt-1">
                        Текущий статус:{" "}
                        <span className="font-semibold">
                          {STATUS_LABELS[order.status]}
                        </span>
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="h32 text-black">{order.total_amount} ₽</p>
                    </div>
                  </div>

                  <StatusProgress status={order.status} />

                  {demoActions(order.status).length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {demoActions(order.status).map(({ label, next }) => (
                        <button
                          key={label}
                          type="button"
                          disabled={updatingId === order.id}
                          onClick={() => void patchOrderStatus(order.id, next)}
                          className={`text16 border px-4 py-2 transition ${
                            updatingId === order.id
                              ? "border-gray-300 text-gray-400"
                              : "border-black bg-white hover:bg-gray-50"
                          }`}
                        >
                          {updatingId === order.id ? "…" : label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 border">
                          {item.image_url && (
                            <Image
                              src={item.image_url}
                              alt={item.name ?? "Товар"}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="text20 font-semibold">
                            {item.name ?? "Товар удалён"}
                          </p>
                          <p className="text16 text-black">
                            {item.quantity} × {item.price_at_purchase} ₽
                          </p>
                        </div>
                      </div>
                      <div className="text20 font-semibold text-black">
                        {item.quantity * item.price_at_purchase} ₽
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
