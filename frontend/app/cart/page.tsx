"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(apiUrl("/cart"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Ошибка загрузки корзины:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const removeItem = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(apiUrl(`/cart/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems(items.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Ошибка при удалении:", err);
    }
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Пожалуйста, войдите в аккаунт");
      return;
    }

    setCheckoutLoading(true);
    try {
      const res = await fetch(apiUrl("/orders/checkout"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.detail || "Не удалось оформить заказ");
        return;
      }

      alert(`Заказ #${data.order_id} успешно оформлен`);
      router.push("/orders");
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Ошибка соединения с сервером");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) {
    return <div className="text-center mt-10 text-black">Загрузка корзины...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Ваша корзина</h1>

        {items.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <p className="text-gray-500 mb-4 text-lg">В корзине пока пусто</p>
            <Link href="/catalog" className="text-blue-600 font-bold hover:underline">
              Перейти к покупкам
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{item.name}</h2>
                    <p className="text-gray-500 text-sm">Цена: {item.price} ₽</p>
                    <p className="text-gray-500 text-sm">Количество: {item.quantity}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <span className="text-xl font-bold text-blue-600">
                    {item.price * item.quantity} ₽
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 transition font-medium text-sm border border-red-100 px-3 py-1 rounded-lg hover:bg-red-50"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-8 bg-white p-6 rounded-xl shadow-lg flex justify-between items-center border-t-4 border-blue-600">
              <div>
                <span className="text-gray-500 text-sm uppercase tracking-wider">Итого к оплате</span>
                <p className="text-4xl font-black text-black">{totalPrice} ₽</p>
              </div>
              <button
                className={`px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg ${
                  checkoutLoading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                }`}
                onClick={handleCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? "Оформляем..." : "Оформить заказ"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
