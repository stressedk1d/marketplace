"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import Toast from "@/app/components/Toast";
import EmptyState from "@/app/components/EmptyState";
import { PageHero } from "@/app/components/PageHero";
import { AdminCharts } from "@/app/components/AdminCharts";
import { pageContent, pageCtaPrimary, pageShell, pageSummaryCard } from "@/lib/page-classes";
import { pageOutlineButton, uiForm } from "@/lib/ui";
import { formatDeliveryLines, parseOrderDelivery } from "@/lib/order-delivery";

const ADMIN_PANEL =
  "overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm ring-1 ring-black/[0.04] dark:border-neutral-700 dark:bg-[var(--surface)] dark:ring-white/[0.06]";

function adminTabClass(active: boolean) {
  return active
    ? "rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-950"
    : "rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800";
}

const ADMIN_ACTION =
  "rounded-full border border-neutral-300 px-2.5 py-1 text-xs transition hover:bg-neutral-950 hover:text-white disabled:opacity-50 dark:border-neutral-600 dark:hover:bg-white dark:hover:text-neutral-950";

const ADMIN_ACTION_DANGER =
  "rounded-full border border-red-300 px-2.5 py-1 text-xs text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-50";

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
  comment?: string | null;
  items: OrderItem[];
}

interface AdminProduct {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  brand_id: number | null;
  collection_id: number | null;
  product_type: string;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface AdminReview {
  id: number;
  user_id: number;
  user_name: string | null;
  product_id: number;
  rating: number;
  text: string | null;
  created_at: string | null;
}

interface EmailLog {
  id: number;
  order_id: number | null;
  to_email: string;
  subject: string;
  body_preview: string;
  sent: boolean;
  created_at: string | null;
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
  const [tab, setTab] = useState<"orders" | "users" | "products" | "reviews" | "email">("orders");
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [productForm, setProductForm] = useState({
    name: "", description: "", price: "", image_url: "", brand_id: "", product_type: "clothing"
  });
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

      const [statsRes, ordersRes, usersRes, maintenanceRes, productsRes, brandsRes, reviewsRes, emailRes] = await Promise.all([
        apiFetch(apiUrl("/admin/stats"), { headers: authHeaders() }),
        apiFetch(apiUrl("/admin/orders?limit=100"), { headers: authHeaders() }),
        apiFetch(apiUrl("/admin/users?limit=100"), { headers: authHeaders() }),
        apiFetch(apiUrl("/admin/maintenance"), { headers: authHeaders() }),
        apiFetch(apiUrl("/products?limit=200&offset=0"), { headers: authHeaders() }),
        fetch(apiUrl("/brands")),
        apiFetch(apiUrl("/admin/reviews?limit=100"), { headers: authHeaders() }),
        apiFetch(apiUrl("/admin/email-logs"), { headers: authHeaders() }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (maintenanceRes.ok) {
        const m = await maintenanceRes.json();
        setMaintenanceEnabled(Boolean(m.enabled));
        setMaintenanceMessage(m.message ?? "");
      }
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.items || []);
      }
      if (brandsRes.ok) {
        setBrands(await brandsRes.json());
      }
      if (reviewsRes.ok) {
        setReviews(await reviewsRes.json());
      }
      if (emailRes.ok) {
        setEmailLogs(await emailRes.json());
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

  const saveProduct = async () => {
    const isEdit = !!editingProduct;
    const url = isEdit ? apiUrl(`/admin/products/${editingProduct!.id}`) : apiUrl("/admin/products");
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await apiFetch(url, {
        method,
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description || null,
          price: parseFloat(productForm.price),
          image_url: productForm.image_url || null,
          brand_id: productForm.brand_id ? parseInt(productForm.brand_id) : null,
          product_type: productForm.product_type,
        }),
      });
      if (res.ok) {
        setToast(isEdit ? "Товар обновлён" : "Товар создан");
        setToastType("success");
        setShowProductForm(false);
        setEditingProduct(null);
        setProductForm({ name: "", description: "", price: "", image_url: "", brand_id: "", product_type: "clothing" });
        loadData();
      } else {
        const data = await res.json();
        setToast(data.detail || "Ошибка"); setToastType("error");
      }
    } catch { setToast("Ошибка сети"); setToastType("error"); }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Удалить товар?")) return;
    try {
      const res = await apiFetch(apiUrl(`/admin/products/${id}`), {
        method: "DELETE", headers: authHeaders(),
      });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        setToast("Товар удалён"); setToastType("success");
      } else {
        const data = await res.json();
        setToast(data.detail || "Ошибка"); setToastType("error");
      }
    } catch { setToast("Ошибка сети"); setToastType("error"); }
  };

  const deleteReview = async (reviewId: number) => {
    if (!confirm("Удалить отзыв?")) return;
    try {
      const res = await apiFetch(apiUrl(`/admin/reviews/${reviewId}`), {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setToast("Отзыв удалён");
        setToastType("success");
      } else {
        const data = await res.json();
        setToast(data.detail || "Ошибка"); setToastType("error");
      }
    } catch { setToast("Ошибка сети"); setToastType("error"); }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiFetch(apiUrl("/admin/upload-image"), {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setProductForm((prev) => ({ ...prev, image_url: data.url }));
        setToast("Изображение загружено");
        setToastType("success");
      } else {
        setToast(data.detail || "Ошибка загрузки"); setToastType("error");
      }
    } catch {
      setToast("Ошибка сети"); setToastType("error");
    } finally {
      setUploadingImage(false);
    }
  };

  const startEditProduct = (p: AdminProduct) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      image_url: p.image_url || "",
      brand_id: p.brand_id ? String(p.brand_id) : "",
      product_type: p.product_type,
    });
    setShowProductForm(true);
  };

  if (loading) {
    return (
      <div className={`${pageShell} flex items-center justify-center`}>
        <p className="text-sm text-neutral-500">Загрузка панели администратора...</p>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className={pageShell}>
        <div className={`${pageContent} pt-8 sm:pt-10`}>
          <EmptyState
            icon="🔒"
            title="Доступ запрещён"
            description="Панель администратора доступна только пользователям из списка ADMIN_EMAILS."
            actionLabel="На главную"
            actionHref="/"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={pageShell}>
      <div className={`${pageContent} pt-8 sm:pt-10`}>
        <PageHero
          eyebrow="Admin"
          title="Админ-панель"
          description="Управление заказами, товарами, пользователями и настройками площадки."
          variant="light"
        >
          <Link
            href="/catalog"
            className="inline-flex items-center rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-50 dark:border-neutral-600 dark:hover:bg-neutral-800"
          >
            В каталог →
          </Link>
        </PageHero>

        {toast && (
          <div className="mb-4">
            <Toast message={toast} type={toastType} />
          </div>
        )}

        <div className={`${pageSummaryCard} mb-8`}>
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-base font-semibold">Технические работы</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {maintenanceEnabled
                  ? "Сайт закрыт для посетителей. Админ-панель доступна."
                  : "Сайт открыт для всех пользователей."}
              </p>
            </div>
            <button
              type="button"
              disabled={maintenanceSaving}
              onClick={toggleMaintenance}
              className={`${maintenanceEnabled ? pageOutlineButton : pageCtaPrimary} !w-auto shrink-0 whitespace-nowrap !min-h-[44px] px-5 !text-sm disabled:opacity-50`}
            >
              {maintenanceSaving
                ? "Сохранение…"
                : maintenanceEnabled
                  ? "Отключить техработы"
                  : "Включить техработы"}
            </button>
          </div>
          <label className={uiForm.label}>Сообщение для посетителей</label>
          <textarea
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
            rows={3}
            className={`${uiForm.input} resize-y`}
            placeholder="Текст на экране техработ…"
          />
        </div>

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className={`${pageSummaryCard} !p-4`}>
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">Пользователи</p>
              <p className="mt-1 text-2xl font-bold">{stats.users_count}</p>
            </div>
            <div className={`${pageSummaryCard} !p-4`}>
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">Товары</p>
              <p className="mt-1 text-2xl font-bold">{stats.products_count}</p>
            </div>
            <div className={`${pageSummaryCard} !p-4`}>
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">Заказы</p>
              <p className="mt-1 text-2xl font-bold">{stats.orders_count}</p>
            </div>
            <div className={`${pageSummaryCard} !p-4`}>
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">Выручка</p>
              <p className="mt-1 text-2xl font-bold">{formatMoney(stats.revenue_total)}</p>
            </div>
          </div>
        )}

        <AdminCharts />

        <div className="mb-6 flex flex-wrap gap-2">
          <button type="button" onClick={() => setTab("orders")} className={adminTabClass(tab === "orders")}>
            Заказы ({orders.length})
          </button>
          <button type="button" onClick={() => setTab("users")} className={adminTabClass(tab === "users")}>
            Пользователи ({users.length})
          </button>
          <button type="button" onClick={() => setTab("products")} className={adminTabClass(tab === "products")}>
            Товары ({products.length})
          </button>
          <button type="button" onClick={() => setTab("reviews")} className={adminTabClass(tab === "reviews")}>
            Отзывы ({reviews.length})
          </button>
          <button type="button" onClick={() => setTab("email")} className={adminTabClass(tab === "email")}>
            Email ({emailLogs.length})
          </button>
        </div>

        {tab === "orders" && (
          <div className={`${ADMIN_PANEL} overflow-x-auto`}>
            {orders.length === 0 ? (
              <p className="p-6 text16 text-gray-500">Заказов пока нет</p>
            ) : (
              <table className="w-full text-left text16 min-w-[720px]">
                <thead className="border-b border-neutral-200/80 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/40">
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
                        {(() => {
                          const delivery = parseOrderDelivery(order.comment);
                          const lines = delivery ? formatDeliveryLines(delivery) : [];
                          if (lines.length === 0) return null;
                          return (
                            <p className="text12 text-gray-500 mt-1 max-w-xs">
                              {lines.join(" · ")}
                            </p>
                          );
                        })()}
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
                              className={ADMIN_ACTION}
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
        )}

        {tab === "users" && (
          <div className={`${ADMIN_PANEL} overflow-x-auto`}>
            {users.length === 0 ? (
              <p className="p-6 text16 text-gray-500">Пользователей нет</p>
            ) : (
              <table className="w-full text-left text16 min-w-[560px]">
                <thead className="border-b border-neutral-200/80 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/40">
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

        {tab === "products" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setProductForm({ name: "", description: "", price: "", image_url: "", brand_id: "", product_type: "clothing" });
                setShowProductForm(true);
              }}
              className={`${pageCtaPrimary} !w-auto inline-flex !min-h-[44px] px-5 !text-sm`}
            >
              + Добавить товар
            </button>

            {showProductForm && (
              <div className={pageSummaryCard}>
                <h3 className="mb-4 text-base font-semibold">{editingProduct ? "Редактировать товар" : "Новый товар"}</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={uiForm.label}>Название *</label>
                    <input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className={uiForm.input} required />
                  </div>
                  <div>
                    <label className={uiForm.label}>Цена *</label>
                    <input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className={uiForm.input} required />
                  </div>
                  <div>
                    <label className={uiForm.label}>URL изображения</label>
                    <input value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} className={uiForm.input} />
                    <div className="mt-2">
                      <label className="block text14 text-gray-500 mb-1">Загрузить файл</label>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleImageUpload(file);
                        }}
                        className="w-full text14"
                      />
                      {uploadingImage && <p className="text14 text-gray-400 mt-1">Загрузка...</p>}
                    </div>
                  </div>
                  <div>
                    <label className={uiForm.label}>Бренд</label>
                    <select value={productForm.brand_id} onChange={e => setProductForm({...productForm, brand_id: e.target.value})} className={uiForm.input}>
                      <option value="">Без бренда</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={uiForm.label}>Тип</label>
                    <select value={productForm.product_type} onChange={e => setProductForm({...productForm, product_type: e.target.value})} className={uiForm.input}>
                      <option value="clothing">Одежда</option>
                      <option value="shoes">Обувь</option>
                      <option value="accessories">Аксессуары</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={uiForm.label}>Описание</label>
                    <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows={3} className={`${uiForm.input} resize-y`} />
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button type="button" onClick={saveProduct} className={`${pageCtaPrimary} !w-auto !min-h-[44px] px-5 !text-sm`}>
                    {editingProduct ? "Сохранить" : "Создать"}
                  </button>
                  <button type="button" onClick={() => { setShowProductForm(false); setEditingProduct(null); }} className={`${pageOutlineButton} !w-auto !min-h-[44px] px-5 !text-sm`}>
                    Отмена
                  </button>
                </div>
              </div>
            )}

            <div className={`${ADMIN_PANEL} overflow-x-auto`}>
              {products.length === 0 ? (
                <p className="p-6 text16 text-gray-500">Товаров нет</p>
              ) : (
                <table className="w-full text-left text16 min-w-[720px]">
                  <thead className="border-b border-neutral-200/80 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/40">
                    <tr>
                      <th className="p-3 font-medium">ID</th>
                      <th className="p-3 font-medium">Название</th>
                      <th className="p-3 font-medium">Цена</th>
                      <th className="p-3 font-medium">Тип</th>
                      <th className="p-3 font-medium">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b border-black/5">
                        <td className="p-3">{p.id}</td>
                        <td className="p-3">{p.name}</td>
                        <td className="p-3">{p.price} ₽</td>
                        <td className="p-3">{p.product_type}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button type="button" onClick={() => startEditProduct(p)} className={ADMIN_ACTION}>Изменить</button>
                            <button type="button" onClick={() => deleteProduct(p.id)} className={ADMIN_ACTION_DANGER}>Удалить</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <div className={`${ADMIN_PANEL} overflow-x-auto`}>
            {reviews.length === 0 ? (
              <p className="p-6 text16 text-gray-500">Отзывов нет</p>
            ) : (
              <table className="w-full text-left text16 min-w-[720px]">
                <thead className="border-b border-neutral-200/80 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/40">
                  <tr>
                    <th className="p-3 font-medium">ID</th>
                    <th className="p-3 font-medium">Товар</th>
                    <th className="p-3 font-medium">Автор</th>
                    <th className="p-3 font-medium">Оценка</th>
                    <th className="p-3 font-medium">Текст</th>
                    <th className="p-3 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r.id} className="border-b border-black/5 align-top">
                      <td className="p-3">{r.id}</td>
                      <td className="p-3">#{r.product_id}</td>
                      <td className="p-3">{r.user_name ?? `User ${r.user_id}`}</td>
                      <td className="p-3">{r.rating} ★</td>
                      <td className="p-3 max-w-xs truncate">{r.text ?? "—"}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => void deleteReview(r.id)}
                          className={ADMIN_ACTION_DANGER}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "email" && (
          <div className={`${ADMIN_PANEL} overflow-x-auto`}>
            {emailLogs.length === 0 ? (
              <p className="p-6 text16 text-gray-500">Логов email нет</p>
            ) : (
              <table className="w-full text-left text16 min-w-[800px]">
                <thead className="border-b border-neutral-200/80 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/40">
                  <tr>
                    <th className="p-3 font-medium">ID</th>
                    <th className="p-3 font-medium">Кому</th>
                    <th className="p-3 font-medium">Тема</th>
                    <th className="p-3 font-medium">Статус</th>
                    <th className="p-3 font-medium">Превью</th>
                    <th className="p-3 font-medium">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {emailLogs.map((log) => (
                    <tr key={log.id} className="border-b border-black/5 align-top">
                      <td className="p-3">{log.id}</td>
                      <td className="p-3">{log.to_email}</td>
                      <td className="p-3">{log.subject}</td>
                      <td className="p-3">{log.sent ? "Отправлено" : "Ошибка"}</td>
                      <td className="p-3 max-w-xs truncate text14 text-gray-600">{log.body_preview}</td>
                      <td className="p-3 whitespace-nowrap text14">
                        {log.created_at ? new Date(log.created_at).toLocaleString("ru-RU") : "—"}
                      </td>
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
