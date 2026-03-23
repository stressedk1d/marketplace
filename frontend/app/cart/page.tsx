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
    return <div className="text-center mt-10 text20">Загрузка корзины...</div>;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-main text-black">
        <h1 className="h32 mb-8">Ваша корзина</h1>

        {items.length === 0 ? (
          <div className="bg-white p-8 border border-black/20 text-center">
            <h2 className="h32 mb-4">Подобрали для вас</h2>
            <p className="mb-4 text24">В корзине пока пусто</p>
            <Link href="/catalog" className="text20 underline">
              Перейти к покупкам
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 flex items-center justify-between border border-black/20"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 bg-gray-100 overflow-hidden border border-black/10">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text20 font-semibold">{item.name}</h2>
                    <p className="text20">Цена: {item.price} ₽</p>
                    <p className="text20">Количество: {item.quantity}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <span className="h32">
                    {item.price * item.quantity} ₽
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text16 border border-black px-4 py-2 bg-white hover:bg-gray-100 transition"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-8 bg-white p-6 flex justify-between items-center border border-black/20">
              <div>
                <p className="text20">Итого к оплате</p>
                <p className="h32">{totalPrice} ₽</p>
                <p className="text16 mt-2 text-gray-700">Соглашение с правилами: принято</p>
              </div>
              <button
                className={`px-10 py-4 text24 transition border border-black ${
                  checkoutLoading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-900"
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
