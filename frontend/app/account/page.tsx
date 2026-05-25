"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import Breadcrumbs from "@/app/components/Breadcrumbs";

interface Order {
  id: number;
  status: string;
  total_amount: number;
  created_at: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  pending:    "В пути",
  processing: "Обрабатывается",
  completed:  "Можно забирать",
  cancelled:  "Отменён",
};

export default function AccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      apiFetch(apiUrl("/auth/profile"), { headers }).then((r) => r.json()),
      apiFetch(apiUrl("/orders/my"), { headers }).then((r) => r.json()),
    ])
      .then(([profile, ordersData]) => {
        setEmail(profile.email ?? "");
        setFullName(profile.full_name ?? "");
        setEditName(profile.full_name ?? "");
        setOrders(ordersData as Order[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const showToast = (text: string, ok: boolean) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSaving(true);
    try {
      const body: Record<string, string> = {};
      if (editName !== fullName) body.full_name = editName;
      if (newPassword) {
        body.current_password = currentPassword;
        body.new_password = newPassword;
      }

      if (Object.keys(body).length === 0) {
        setEditing(false);
        return;
      }

      const res = await apiFetch(apiUrl("/auth/profile"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        if (body.full_name) setFullName(body.full_name);
        setCurrentPassword("");
        setNewPassword("");
        setEditing(false);
        showToast("Профиль обновлён", true);
      } else {
        const data = await res.json();
        showToast(data.detail || "Ошибка сохранения", false);
      }
    } catch {
      showToast("Ошибка соединения", false);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) return <div className="text-center mt-10 text20">Загрузка...</div>;

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="min-h-screen py-8">
      <div className="container-main text-black">
        <Breadcrumbs items={[{ label: "Аккаунт" }]} />
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 px-5 py-3 text16 shadow-lg border ${
              toast.ok
                ? "bg-green-50 border-green-400 text-green-800"
                : "bg-red-50 border-red-400 text-red-800"
            }`}
          >
            {toast.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая панель — профиль */}
          <aside className="border border-black/15 bg-white p-5 h-fit">
            {/* Аватар */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-[#d9d9d9] flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#888" strokeWidth="1.5"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text16 font-semibold truncate">{fullName || email.split("@")[0]}</p>
                <p className="text16 text-gray-400 text-sm truncate">{email}</p>
              </div>
            </div>

            {editing ? (
              <div className="space-y-3 mb-5">
                <div>
                  <label className="text16 text-gray-500 block mb-1">Имя</label>
                  <input
                    type="text"
                    className="w-full border border-black/20 bg-transparent p-2 outline-none text16"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <p className="text16 text-gray-400 mt-3">Смена пароля</p>
                <div>
                  <label className="text16 text-gray-500 block mb-1">Текущий пароль</label>
                  <input
                    type="password"
                    className="w-full border border-black/20 bg-transparent p-2 outline-none text16"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Оставьте пустым, если не меняете"
                  />
                </div>
                <div>
                  <label className="text16 text-gray-500 block mb-1">Новый пароль</label>
                  <input
                    type="password"
                    className="w-full border border-black/20 bg-transparent p-2 outline-none text16"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Оставьте пустым, если не меняете"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2 text16 bg-black text-white hover:bg-gray-900 disabled:bg-gray-400"
                  >
                    {saving ? "Сохранение..." : "Сохранить"}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditName(fullName);
                      setCurrentPassword("");
                      setNewPassword("");
                    }}
                    className="flex-1 py-2 text16 border border-black bg-white hover:bg-gray-100"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="w-full py-2 text16 bg-black text-white hover:bg-gray-900 mb-5"
              >
                Редактировать
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full py-2 text16 border border-black bg-white hover:bg-gray-100"
            >
              Выйти
            </button>
          </aside>

          {/* Правая часть */}
          <div className="lg:col-span-2 space-y-4">
            {/* Баннер */}
            <div className="h-48 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-700 border border-black/10 flex items-center px-8">
              <div className="text-white">
                <h2 className="text-2xl font-bold">Добро пожаловать в VogueWay</h2>
                <p className="text-neutral-300 mt-1">Управляйте заказами и настройками аккаунта</p>
              </div>
            </div>

            {/* Заказы */}
            <div className="border border-black/15 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text20 font-semibold">Заказы</h2>
                <Link href="/orders" className="text16 text-gray-500 hover:underline flex items-center gap-1">
                  Все ›
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <p className="text16 text-gray-400 text-center py-6">Заказов пока нет</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border border-black/10 bg-[#f3f3f3] p-3">
                      <p className="text16 font-semibold text-[#b5a97a]">
                        {STATUS_LABEL[order.status] ?? order.status}
                      </p>
                      <p className="text16 text-gray-400 text-sm mt-0.5">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString("ru-RU") : ""}
                      </p>
                      <p className="text16 mt-1 text-black">Заказ #{order.id} · {order.total_amount} ₽</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Быстрые ссылки */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Избранное", href: "/wishlist", sub: "Ваши товары" },
                { label: "Заказы", href: "/orders", sub: "Все заказы" },
                { label: "FAQ", href: "/faq", sub: "Частые вопросы" },
              ].map((block) => (
                <Link
                  key={block.label}
                  href={block.href}
                  className="border border-black/15 bg-white p-4 flex flex-col justify-between min-h-[100px] hover:bg-gray-50 transition-colors"
                >
                  <p className="text16 font-semibold">{block.label}</p>
                  <p className="text16 text-gray-400 text-sm">{block.sub}</p>
                </Link>
              ))}
            </div>

            {/* Сервис и помощь */}
            <div className="border border-black/15 bg-white p-5">
              <h2 className="text20 font-semibold mb-4">Сервис и помощь</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/faq"
                  className="flex items-center justify-center py-2.5 text16 bg-black text-white hover:bg-gray-900"
                >
                  Частые вопросы
                </Link>
                <Link
                  href="/contacts"
                  className="flex items-center justify-center py-2.5 text16 bg-black text-white hover:bg-gray-900"
                >
                  Контакты
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
