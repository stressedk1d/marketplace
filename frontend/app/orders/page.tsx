"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import Toast from "@/app/components/Toast";

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
  status: string;
  total_amount: number;
  created_at: string | null;
  items: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authMissing, setAuthMissing] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setAuthMissing(true); setLoading(false); return; }
      try {
        const res = await apiFetch(apiUrl("/orders/my"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setOrders(await res.json());
        else setError("Не удалось загрузить заказы");
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "SESSION_EXPIRED") {
          router.push("/login?reason=session_expired");
        } else {
          setError("Ошибка соединения с сервером");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [router]);

  if (loading) return <div className="text-center mt-10 text20">Загрузка заказов...</div>;

  if (authMissing) return (
    <div className="min-h-screen py-8">
      <div className="container-main max-w-3xl bg-white p-8 border border-black/20 text-center">
        <h1 className="h32 mb-3">История заказов</h1>
        <p className="text20 mb-4">Для просмотра заказов нужно войти в аккаунт.</p>
        <Link href="/login" className="text20 underline">Перейти ко входу</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="container-main text-black">
        <h1 className="h32 mb-6">Мои заказы</h1>

        {error && <div className="mb-4"><Toast message={error} type="error" /></div>}

        {orders.length === 0 ? (
          <div className="bg-white p-8 border border-black/20 text-center">
            <p className="text20 mb-4">У вас пока нет заказов.</p>
            <Link href="/catalog" className="text20 underline">Перейти в каталог</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <article key={order.id} className="bg-white border border-black/20">
                <div className="p-5 border-b border-black/10 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <h2 className="text20 font-semibold">Заказ #{order.id}</h2>
                    <p className="text16 text-gray-600">
                      {order.created_at ? new Date(order.created_at).toLocaleString("ru-RU") : "Дата недоступна"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text16">Статус: {order.status}</p>
                    <p className="h32">{order.total_amount} ₽</p>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 border">
                          {item.image_url && (
                            <Image src={item.image_url} alt={item.name ?? "Товар"} fill unoptimized className="object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="text20 font-semibold">{item.name ?? "Товар удалён"}</p>
                          <p className="text16 text-gray-600">{item.quantity} x {item.price_at_purchase} ₽</p>
                        </div>
                      </div>
                      <div className="text20 font-semibold">{item.quantity * item.price_at_purchase} ₽</div>
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
