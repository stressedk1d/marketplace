"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import Toast from "@/app/components/Toast";
import { useCart } from "@/lib/CartContext";

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { refreshCart } = useCart();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [payMethod, setPayMethod] = useState<"pickup" | "online">("pickup");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  const notify = (text: string, type: "success" | "error" | "info" = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    apiFetch(apiUrl("/cart"), { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.ok) setItems(await res.json());
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message === "SESSION_EXPIRED") {
          router.push("/login?reason=session_expired");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleSubmit = async () => {
    if (!fullName.trim() || !phone.trim() || !city.trim() || !address.trim()) {
      notify("Заполните все обязательные поля", "error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch(apiUrl("/orders/checkout"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          city: city.trim(),
          address: address.trim(),
          comment: comment.trim(),
          pay_method: payMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify(data.detail || "Не удалось оформить заказ", "error");
        return;
      }
      notify(`Заказ #${data.order_id} успешно оформлен`, "success");
      refreshCart();
      setTimeout(() => router.push("/orders"), 1200);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") {
        router.push("/login?reason=session_expired");
      } else {
        notify("Ошибка соединения с сервером", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text20">Загрузка...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-main text-black text-center py-16">
          <h1 className="h32 mb-4">Корзина пуста</h1>
          <p className="text16 text-gray-500 mb-6">Добавьте товары, чтобы оформить заказ</p>
          <Link href="/catalog" className="text16 underline">
            Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-main text-black">
        {message && (
          <div className="mb-4">
            <Toast message={message} type={messageType} />
          </div>
        )}

        <div className="flex items-center gap-3 mb-6">
          <Link href="/cart" className="text16 text-gray-500 hover:text-black">
            ← Вернуться в корзину
          </Link>
        </div>

        <h1 className="h32 mb-6">Оформление заказа</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка — форма доставки */}
          <div className="lg:col-span-2 space-y-4">
            {/* Адрес доставки */}
            <div className="border border-black/15 bg-white p-5">
              <h2 className="text20 font-semibold mb-4">Адрес доставки</h2>

              <div className="space-y-3">
                <div>
                  <label className="text16 text-gray-500 mb-1 block">
                    ФИО получателя <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Иванов Иван Иванович"
                    className="w-full border border-black/15 px-3 py-2 text16 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text16 text-gray-500 mb-1 block">
                    Телефон <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (999) 123-45-67"
                    className="w-full border border-black/15 px-3 py-2 text16 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text16 text-gray-500 mb-1 block">
                    Город <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Москва"
                    className="w-full border border-black/15 px-3 py-2 text16 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text16 text-gray-500 mb-1 block">
                    Адрес (улица, дом, квартира) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="ул. Пушкина, д. 10, кв. 5"
                    className="w-full border border-black/15 px-3 py-2 text16 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text16 text-gray-500 mb-1 block">
                    Комментарий к заказу
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Дополнительная информация для курьера"
                    rows={3}
                    className="w-full border border-black/15 px-3 py-2 text16 outline-none focus:border-black resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Способ доставки */}
            <div className="border border-black/15 bg-white p-5">
              <h2 className="text20 font-semibold mb-1">Способ доставки</h2>
              <p className="text16 text-gray-500 mb-3">Курьерская доставка по указанному адресу</p>
              <p className="text16 font-semibold">Доставка VogueWay | Бесплатно</p>
            </div>

            {/* Товары в заказе */}
            <div className="border border-black/15 bg-white">
              <div className="px-5 py-3 border-b border-black/10">
                <h2 className="text20 font-semibold">
                  Товары в заказе ({totalCount})
                </h2>
              </div>
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 ${idx < items.length - 1 ? "border-b border-black/10" : ""}`}
                >
                  <div className="flex gap-4">
                    <div className="relative w-16 h-16 bg-[#d9d9d9] shrink-0">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text16 font-semibold line-clamp-2">{item.name}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text16 text-gray-500">
                          {item.quantity} шт.
                        </span>
                        <span className="text16 text-black font-semibold">
                          {item.price * item.quantity} ₽
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Правая колонка — итог */}
          <div>
            <div className="border border-black/15 bg-white p-5 lg:sticky lg:top-8">
              <h2 className="text20 font-semibold mb-4">Ваш заказ</h2>

              <p className="text16 font-semibold mb-2">Способ оплаты</p>
              <div className="flex mb-4">
                <button
                  onClick={() => setPayMethod("pickup")}
                  className={`flex-1 py-1.5 text16 ${
                    payMethod === "pickup"
                      ? "bg-black text-white"
                      : "border border-black bg-white hover:bg-gray-50"
                  }`}
                >
                  При получении
                </button>
                <button
                  onClick={() => setPayMethod("online")}
                  className={`flex-1 py-1.5 text16 ${
                    payMethod === "online"
                      ? "bg-black text-white"
                      : "border border-black bg-white hover:bg-gray-50"
                  }`}
                >
                  Онлайн
                </button>
              </div>

              <div className="space-y-1 mb-4">
                <div className="flex justify-between text16 text-black">
                  <span>Товары, {totalCount} шт.</span>
                  <span>{totalPrice} ₽</span>
                </div>
                <div className="flex justify-between text16 text-black">
                  <span>Доставка</span>
                  <span className="text-green-600">Бесплатно</span>
                </div>
              </div>

              <div className="flex justify-between text20 font-semibold mb-5 text-black border-t border-black/10 pt-3">
                <span>Итого</span>
                <span>{totalPrice} ₽</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`w-full py-3 text20 border border-black ${
                  submitting
                    ? "bg-gray-400 text-white"
                    : "bg-black text-white hover:bg-gray-900"
                }`}
              >
                {submitting ? "Оформляем..." : "Оформить заказ"}
              </button>

              <p className="text-center text16 text-gray-400 mt-3">
                Нажимая «Оформить заказ», вы соглашаетесь с правилами пользования торговой площадкой
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
