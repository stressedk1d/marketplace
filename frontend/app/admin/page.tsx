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
  const [tab, setTab] = useState<"orders" | "users" | "products">("orders");
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
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

      const [statsRes, ordersRes, usersRes, maintenanceRes, productsRes, brandsRes] = await Promise.all([
        apiFetch(apiUrl("/admin/stats"), { headers: authHeaders() }),
        apiFetch(apiUrl("/admin/orders?limit=100"), { headers: authHeaders() }),
        apiFetch(apiUrl("/admin/users?limit=100"), { headers: authHeaders() }),
        apiFetch(apiUrl("/admin/maintenance"), { headers: authHeaders() }),
        apiFetch(apiUrl("/products?limit=200&offset=0"), { headers: authHeaders() }),
        fetch(apiUrl("/brands")),
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
              Управление заказами, товарами и пользователями
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
          <button
            type="button"
            onClick={() => setTab("products")}
            className={`px-4 py-2 text16 border ${tab === "products" ? "bg-black text-white border-black" : "bg-white border-black/30"}`}
          >
            Товары ({products.length})
          </button>
        </div>

        {tab === "orders" && (
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
        )}

        {tab === "users" && (
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

        {tab === "products" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setProductForm({ name: "", description: "", price: "", image_url: "", brand_id: "", product_type: "clothing" });
                setShowProductForm(true);
              }}
              className="px-5 py-2 text16 bg-black text-white border border-black hover:bg-gray-900"
            >
              + Добавить товар
            </button>

            {showProductForm && (
              <div className="bg-white border border-black/20 p-5">
                <h3 className="text20 font-semibold mb-4">{editingProduct ? "Редактировать товар" : "Новый товар"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text16 mb-1">Название *</label>
                    <input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full border border-black/30 p-2 text16" required />
                  </div>
                  <div>
                    <label className="block text16 mb-1">Цена *</label>
                    <input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full border border-black/30 p-2 text16" required />
                  </div>
                  <div>
                    <label className="block text16 mb-1">URL изображения</label>
                    <input value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} className="w-full border border-black/30 p-2 text16" />
                  </div>
                  <div>
                    <label className="block text16 mb-1">Бренд</label>
                    <select value={productForm.brand_id} onChange={e => setProductForm({...productForm, brand_id: e.target.value})} className="w-full border border-black/30 p-2 text16">
                      <option value="">Без бренда</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text16 mb-1">Тип</label>
                    <select value={productForm.product_type} onChange={e => setProductForm({...productForm, product_type: e.target.value})} className="w-full border border-black/30 p-2 text16">
                      <option value="clothing">Одежда</option>
                      <option value="shoes">Обувь</option>
                      <option value="accessories">Аксессуары</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text16 mb-1">Описание</label>
                    <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows={3} className="w-full border border-black/30 p-2 text16 resize-y" />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={saveProduct} className="px-5 py-2 text16 bg-black text-white border border-black hover:bg-gray-900">
                    {editingProduct ? "Сохранить" : "Создать"}
                  </button>
                  <button type="button" onClick={() => { setShowProductForm(false); setEditingProduct(null); }} className="px-5 py-2 text16 border border-black bg-white hover:bg-gray-100">
                    Отмена
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white border border-black/20 overflow-x-auto">
              {products.length === 0 ? (
                <p className="p-6 text16 text-gray-500">Товаров нет</p>
              ) : (
                <table className="w-full text-left text16 min-w-[720px]">
                  <thead className="border-b border-black/10 bg-[#f9f9f9]">
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
                            <button type="button" onClick={() => startEditProduct(p)} className="text14 px-2 py-1 border border-black/30 hover:bg-black hover:text-white">Изменить</button>
                            <button type="button" onClick={() => deleteProduct(p.id)} className="text14 px-2 py-1 border border-red-300 text-red-600 hover:bg-red-600 hover:text-white">Удалить</button>
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
      </div>
    </div>
  );
}
