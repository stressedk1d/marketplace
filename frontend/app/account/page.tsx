"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { PageHero } from "@/app/components/PageHero";
import { AccountPageSkeleton } from "@/app/components/ProductGridSkeleton";
import { useToast } from "@/lib/ToastContext";
import { formatPrice } from "@/lib/format";
import {
  pageContent,
  pageCtaPrimary,
  pageShell,
  pageSummaryCard,
} from "@/lib/page-classes";
import { pageOutlineButton, uiForm } from "@/lib/ui";

interface Order {
  id: number;
  status: string;
  total_amount: number;
  created_at: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "В пути",
  processing: "Обрабатывается",
  completed: "Можно забирать",
  cancelled: "Отменён",
  created: "Оформлен",
  paid: "Оплачен",
  shipped: "Отправлен",
  delivered: "Доставлен",
};

export default function AccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      apiFetch(apiUrl("/auth/profile"), { headers }).then((r) => r.json()),
      apiFetch(apiUrl("/orders/my"), { headers }).then((r) => r.json()),
    ])
      .then(([profile, ordersData]) => {
        setEmail(profile.email ?? "");
        setFullName(profile.full_name ?? "");
        setEditName(profile.full_name ?? "");
        setLoyaltyPoints(Number(profile.loyalty_points) || 0);
        setOrders(ordersData as Order[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

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
        showToast("Профиль обновлён", "success");
      } else {
        const data = await res.json();
        showToast(data.detail || "Ошибка сохранения", "error");
      }
    } catch {
      showToast("Ошибка соединения", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) return <AccountPageSkeleton />;

  const recentOrders = orders.slice(0, 3);

  return (
    <div className={pageShell}>
      <div className={`${pageContent} pt-8 sm:pt-10`}>
        <Breadcrumbs items={[{ label: "Аккаунт" }]} />

        <PageHero
          eyebrow="Account"
          title={fullName || "Личный кабинет"}
          description="Управляйте профилем, отслеживайте заказы и накапливайте баллы лояльности."
          variant="light"
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <aside className={`${pageSummaryCard} h-fit lg:sticky lg:top-28 lg:self-start`}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                <span className="text-xl font-bold text-neutral-600 dark:text-neutral-300">
                  {(fullName || email).charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-neutral-900 dark:text-neutral-50">
                  {fullName || email.split("@")[0]}
                </p>
                <p className="truncate text-sm text-neutral-500">{email}</p>
              </div>
            </div>

            {editing ? (
              <div className="mb-5 space-y-3">
                <div>
                  <label className={uiForm.label}>Имя</label>
                  <input
                    type="text"
                    className={uiForm.input}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Смена пароля
                </p>
                <div>
                  <label className={uiForm.label}>Текущий пароль</label>
                  <input
                    type="password"
                    className={uiForm.input}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Если меняете пароль"
                  />
                </div>
                <div>
                  <label className={uiForm.label}>Новый пароль</label>
                  <input
                    type="password"
                    className={uiForm.input}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex-1 ${pageCtaPrimary} !min-h-[44px] !text-sm`}
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
                    className={`flex-1 ${pageOutlineButton} !min-h-[44px] !text-sm`}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className={`mb-5 ${pageCtaPrimary} !min-h-[44px] !text-sm`}
              >
                Редактировать профиль
              </button>
            )}

            <button onClick={handleLogout} className={pageOutlineButton}>
              Выйти
            </button>

            <div className="mt-5 rounded-xl border border-neutral-200/90 bg-neutral-50/80 p-4 dark:border-neutral-700 dark:bg-neutral-900/40">
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                Баллы лояльности
              </p>
              <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {loyaltyPoints}
              </p>
            </div>
          </aside>

          <div className="space-y-6 lg:col-span-2">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 p-8 text-white shadow-lg">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                VogueWay
              </p>
              <h2 className="text-2xl font-bold tracking-tight">Добро пожаловать</h2>
              <p className="mt-2 max-w-md text-sm text-neutral-300">
                Ваши заказы, избранное и персональные настройки — всё в одном месте.
              </p>
            </div>

            <div className={pageSummaryCard}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Последние заказы</h2>
                <Link
                  href="/orders"
                  className="text-sm text-neutral-500 transition hover:text-neutral-900 dark:hover:text-white"
                >
                  Все заказы →
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <p className="py-6 text-center text-sm text-neutral-500">Заказов пока нет</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href="/orders"
                      className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 transition hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900/30 dark:hover:border-neutral-600"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                        {STATUS_LABEL[order.status] ?? order.status}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString("ru-RU")
                          : ""}
                      </p>
                      <p className="mt-2 text-sm font-semibold">
                        #{order.id} · {formatPrice(order.total_amount)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: "Избранное", href: "/wishlist", sub: "Сохранённые товары" },
                { label: "Заказы", href: "/orders", sub: "История покупок" },
                { label: "FAQ", href: "/faq", sub: "Частые вопросы" },
              ].map((block) => (
                <Link
                  key={block.label}
                  href={block.href}
                  className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-neutral-700 dark:bg-[var(--surface)] dark:hover:border-neutral-500"
                >
                  <p className="font-semibold">{block.label}</p>
                  <p className="mt-1 text-sm text-neutral-500">{block.sub}</p>
                </Link>
              ))}
            </div>

            <div className={pageSummaryCard}>
              <h2 className="mb-4 text-lg font-semibold">Сервис и помощь</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link href="/faq" className={pageCtaPrimary}>
                  Частые вопросы
                </Link>
                <Link
                  href="/contacts"
                  className={`${pageOutlineButton} text-center`}
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
