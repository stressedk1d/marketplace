"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    // Декодируем email из JWT payload
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setEmail(payload.sub ?? "");
    } catch {}

    apiFetch(apiUrl("/orders/my"), { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: Order[]) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) return <div className="text-center mt-10 text20">Загрузка...</div>;

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="min-h-screen py-8">
      <div className="container-main text-black">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Левая панель — профиль */}
          <aside className="border border-black/15 bg-white p-5 h-fit">
            {/* Аватар + имя */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#d9d9d9] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="#888" strokeWidth="1.5"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text16 font-semibold">{email.split("@")[0]}</p>
                  <p className="text16 text-gray-400 text-sm">{email}</p>
                </div>
              </div>
              {/* колокольчик */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="#888"/>
              </svg>
            </div>

            {/* Финансы */}
            <p className="text16 text-gray-400 mb-2">Финансы</p>
            <div className="space-y-2 mb-5">
              <button className="w-full py-2 text16 bg-black text-white hover:bg-gray-900">Способы оплаты</button>
              <button className="w-full py-2 text16 bg-black text-white hover:bg-gray-900">Реквизиты</button>
            </div>

            {/* Управление */}
            <p className="text16 text-gray-400 mb-2">Управление</p>
            <div className="space-y-2 mb-5">
              <button className="w-full py-2 text16 bg-black text-white hover:bg-gray-900">Настройки</button>
              <button className="w-full py-2 text16 bg-black text-white hover:bg-gray-900">Ваши устройства</button>
            </div>

            {/* Бизнес */}
            <p className="text16 text-gray-400 mb-2">Бизнес</p>
            <button className="w-full py-2 text16 bg-[#e9e7bf] hover:brightness-95 mb-5">
              Покупайте как бизнес
            </button>

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
            <div className="h-48 bg-[#d9d9d9] border border-black/10" />

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
                      <p className="text16 mt-1">Заказ #{order.id} · {order.total_amount} ₽</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Избранное / Покупки / Ждут оценки */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Избранное", icon: "♡", sub: "нет товаров" },
                { label: "Покупки",   icon: "🛍", sub: "Смотреть" },
                { label: "Ждут оценки", icon: "🔥", sub: "нет товаров" },
              ].map((block) => (
                <div key={block.label} className="border border-black/15 bg-white p-4 flex flex-col justify-between min-h-[100px]">
                  <p className="text16 font-semibold">{block.label}</p>
                  <div className="flex items-end justify-between">
                    <p className="text16 text-gray-400 text-sm">{block.sub}</p>
                    <span className="text-2xl">{block.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Сервис и помощь */}
            <div className="border border-black/15 bg-white p-5">
              <h2 className="text20 font-semibold mb-4">Сервис и помощь</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Написать в поддержку", icon: "💬" },
                  { label: "Вернуть товар",         icon: "📦" },
                  { label: "Частые вопросы",        icon: "❓" },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    className="flex items-center justify-center gap-2 py-2.5 text16 bg-black text-white hover:bg-gray-900"
                  >
                    <span>{btn.icon}</span>
                    <span>{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
