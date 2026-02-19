"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiUrl } from "@/lib/api";

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authMissing, setAuthMissing] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthMissing(true);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(apiUrl("/orders/my"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error("Orders fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-black">Загрузка заказов...</div>;
  }

  if (authMissing) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 text-black">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <h1 className="text-2xl font-bold mb-3">История заказов</h1>
          <p className="text-gray-600 mb-4">Для просмотра заказов нужно войти в аккаунт.</p>
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Перейти ко входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Мои заказы</h1>

        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-gray-600 mb-4">У вас пока нет заказов.</p>
            <Link href="/catalog" className="text-blue-600 font-bold hover:underline">
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <article key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold">Заказ #{order.id}</h2>
                    <p className="text-sm text-gray-500">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString("ru-RU")
                        : "Дата недоступна"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Статус: {order.status}</p>
                    <p className="text-xl font-black text-blue-600">{order.total_amount} ₽</p>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 border">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.name ?? "Товар"}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-semibold">{item.name ?? "Товар удален"}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} x {item.price_at_purchase} ₽
                          </p>
                        </div>
                      </div>
                      <div className="font-bold">{item.quantity * item.price_at_purchase} ₽</div>
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
