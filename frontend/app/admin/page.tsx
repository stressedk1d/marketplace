"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import Toast from "@/app/components/Toast";

type OrderStatus = "created" | "paid" | "shipped" | "delivered" | "cancelled";

interface AdminStats {
  users_count: number;
  products_count: number;
  orders_count: number;
  revenue_total: number;
}

interface AdminUser {
  id: number;
  email: string;
  full_name: string | null;
  is_verified: boolean;
  is_admin: boolean;
}

interface OrderItem {
  id: number;
  product_id: number;
  name: string | null;
  quantity: number;
  price_at_purchase: number;
}

interface AdminOrder {
  id: number;
  status: OrderStatus;
  total_amount: number;
  created_at: string | null;
  user_id: number;
  user_email: string | null;
  user_full_name: string | null;
  items: OrderItem[];
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  created: "Оформлен",
  paid: "Оплачен",
  shipped: "Отправлен",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

const NEXT_STATUS: Partial<Record<OrderStatus, { label: string; status: OrderStatus }[]>> = {
  created: [
    { label: "→ Оплачен", status: "paid" },
    { label: "→ Отменён", status: "cancelled" },
  ],
  paid: [
    { label: "→ Отправлен", status: "shipped" },
    { label: "→ Отменён", status: "cancelled" },
  ],
  shipped: [
    { label: "→ Доставлен", status: "delivered" },
    { label: "→ Отменён", status: "cancelled" },
  ],
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tab, setTab] = useState<"orders" | "users">("orders");
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);

  const authHeaders = useCallback((): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const loadData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const meRes = await apiFetch(apiUrl("/admin/me"), {
        headers: authHeaders(),
      });
      if (meRes.status === 403) {
        setForbidden(true);
        setLoading(false);
        return;
      }
      if (!meRes.ok) {
        router.push("/login");
        return;
      }

      const [statsRes, ordersRes, usersRes, maintenanceRes] = await Promise.all([
        apiFetch(apiUrl("/admin/stats"), { headers: authHeaders() }),
        apiFetch(apiUrl("/admin/orders?limit=100"), { headers: authHeaders() }),
        apiFetch(apiUrl("/admin/users?limit=100"), { headers: authHeaders() }),
        apiFetch(apiUrl("/admin/maintenance"), { headers: authHeaders() }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (maintenanceRes.ok) {
        const m = await maintenanceRes.json();
        setMaintenanceEnabled(Boolean(m.enabled));
        setMaintenanceMessage(m.message ?? "");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") {
        router.push("/login?reason=session_expired");
        return;
      }
      setToastType("error");
      setToast("Не удалось загрузить данные админки");
    } finally {
      setLoading(false);
    }
  }, [authHeaders, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleMaintenance = async () => {
    setMaintenanceSaving(true);
    try {
      const res = await apiFetch(apiUrl("/admin/maintenance"), {
        method: "PUT",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: !maintenanceEnabled,
          message: maintenanceMessage,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMaintenanceEnabled(Boolean(data.enabled));
        setMaintenanceMessage(data.message ?? "");
        setToastType("success");
        setToast(
          data.enabled
            ? "Режим «Технические работы» включён для посетителей"
            : "Сайт снова доступен для всех"
        );
      } else {
        const data = await res.json();
        setToastType("error");
        setToast(data.detail || "Не удалось изменить режим");
      }
    } catch {
      setToastType("error");
      setToast("Ошибка сети");
    } finally {
      setMaintenanceSaving(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await apiFetch(apiUrl(`/admin/orders/${orderId}/status`), {
        method: "PATCH",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: updated.status as OrderStatus } : o
          )
        );
        setToastType("success");
        setToast(`Заказ №${orderId}: ${STATUS_LABELS[status]}`);
      } else {
        const data = await res.json();
        setToastType("error");
        setToast(data.detail || "Не удалось обновить статус");
      }
    } catch {
      setToastType("error");
      setToast("Ошибка сети");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <p className="text-center mt-10 text20">Загрузка панели администратора...</p>;
  }

  if (forbidden) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-main max-w-xl bg-white p-8 border border-black/20 text-center">
          <h1 className="h32 mb-3">Доступ запрещён</h1>
          <p className="text16 text-gray-600 mb-4">
            Панель администратора доступна только пользователям из списка ADMIN_EMAILS.
          </p>
          <Link href="/" className="text16 underline">
            На главную
          </Link>
        </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-main text-black">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="h32">Админ-панель VogueWay</h1>
            <p className="text16 text-gray-600 mt-1">
              Управление заказами и пользователями
            </p>
          </div>
          <Link href="/catalog" className="text16 underline">
            В каталог
          </Link>
        </div>

        {toast && (
          <div className="mb-4">
            <Toast message={toast} type={toastType} />
          </div>
        )}

        <div className="bg-white border border-black/20 p-5 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text20 font-semibold">Технические работы</h2>
              <p className="text16 text-gray-600 mt-1">
                {maintenanceEnabled
                  ? "Сайт закрыт для посетителей. Админ-панель доступна."
                  : "Сайт открыт для всех пользователей."}
              </p>
            </div>
            <button
              type="button"
              disabled={maintenanceSaving}
              onClick={toggleMaintenance}
              className={`px-5 py-2 text16 border whitespace-nowrap disabled:opacity-50 ${
                maintenanceEnabled
                  ? "bg-[var(--accent-soft)] border-black text-black"
                  : "bg-black text-white border-black"
              }`}
            >
              {maintenanceSaving
                ? "Сохранение…"
                : maintenanceEnabled
                  ? "Отключить техработы"
                  : "Включить техработы"}
            </button>
          </div>
          <label className="block text16 mb-2">Сообщение для посетителей</label>
          <textarea
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
            rows={3}
            className="w-full border border-black/30 p-3 text16 bg-[#fafafa] resize-y"
            placeholder="Текст на экране техработ…"
          />
        </div>

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-black/20 p-4">
              <p className="text14 text-gray-500">Пользователи</p>
              <p className="text24 font-semibold mt-1">{stats.users_count}</p>
            </div>
            <div className="bg-white border border-black/20 p-4">
              <p className="text14 text-gray-500">Товары</p>
              <p className="text24 font-semibold mt-1">{stats.products_count}</p>
            </div>
            <div className="bg-white border border-black/20 p-4">
              <p className="text14 text-gray-500">Заказы</p>
              <p className="text24 font-semibold mt-1">{stats.orders_count}</p>
            </div>
            <div className="bg-white border border-black/20 p-4">
              <p className="text14 text-gray-500">Выручка</p>
              <p className="text24 font-semibold mt-1">{formatMoney(stats.revenue_total)}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab("orders")}
            className={`px-4 py-2 text16 border ${tab === "orders" ? "bg-black text-white border-black" : "bg-white border-black/30"}`}
          >
            Заказы ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("users")}
            className={`px-4 py-2 text16 border ${tab === "users" ? "bg-black text-white border-black" : "bg-white border-black/30"}`}
          >
            Пользователи ({users.length})
          </button>
        </div>

        {tab === "orders" ? (
          <div className="bg-white border border-black/20 overflow-x-auto">
            {orders.length === 0 ? (
              <p className="p-6 text16 text-gray-500">Заказов пока нет</p>
            ) : (
              <table className="w-full text-left text16 min-w-[720px]">
                <thead className="border-b border-black/10 bg-[#f9f9f9]">
                  <tr>
                    <th className="p-3 font-medium">№</th>
                    <th className="p-3 font-medium">Клиент</th>
                    <th className="p-3 font-medium">Сумма</th>
                    <th className="p-3 font-medium">Статус</th>
                    <th className="p-3 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-black/5 align-top">
                      <td className="p-3">#{order.id}</td>
                      <td className="p-3">
                        <p>{order.user_full_name || "—"}</p>
                        <p className="text14 text-gray-500">{order.user_email}</p>
                        <p className="text12 text-gray-400 mt-1">
                          {order.items.length} поз.
                          {order.created_at
                            ? ` · ${new Date(order.created_at).toLocaleString("ru-RU")}`
                            : ""}
                        </p>
                      </td>
                      <td className="p-3 whitespace-nowrap">{formatMoney(order.total_amount)}</td>
                      <td className="p-3">{STATUS_LABELS[order.status]}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          {(NEXT_STATUS[order.status] ?? []).map((action) => (
                            <button
                              key={action.status}
                              type="button"
                              disabled={updatingId === order.id}
                              onClick={() => updateOrderStatus(order.id, action.status)}
                              className="text14 px-2 py-1 border border-black/30 hover:bg-black hover:text-white disabled:opacity-50"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="bg-white border border-black/20 overflow-x-auto">
            {users.length === 0 ? (
              <p className="p-6 text16 text-gray-500">Пользователей нет</p>
            ) : (
              <table className="w-full text-left text16 min-w-[560px]">
                <thead className="border-b border-black/10 bg-[#f9f9f9]">
                  <tr>
                    <th className="p-3 font-medium">ID</th>
                    <th className="p-3 font-medium">Email</th>
                    <th className="p-3 font-medium">Имя</th>
                    <th className="p-3 font-medium">Роль</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-black/5">
                      <td className="p-3">{user.id}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">{user.full_name || "—"}</td>
                      <td className="p-3">{user.is_admin ? "Админ" : "Пользователь"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
