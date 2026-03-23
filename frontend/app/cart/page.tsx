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

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  description: string;
}

export default function CartPage() {
  const router = useRouter();
  const { refreshCart } = useCart();
  const [items, setItems] = useState<CartItem[]>([]);
  const [suggested, setSuggested] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  const notify = (text: string, type: "success" | "error" | "info" = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    try {
      const res = await apiFetch(apiUrl("/cart"), { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setItems(await res.json());
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") {
        router.push("/login?reason=session_expired");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    fetch(apiUrl("/products"))
      .then((r) => r.json())
      .then((data: Product[]) => setSuggested(data.slice(0, 6)))
      .catch(() => {});
  }, []);

  const removeItem = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await apiFetch(apiUrl(`/cart/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (res.ok) { setItems(items.filter((i) => i.id !== id)); refreshCart(); }
      else notify("Не удалось удалить товар", "error");
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") router.push("/login?reason=session_expired");
    }
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    setCheckoutLoading(true);
    try {
      const res = await apiFetch(apiUrl("/orders/checkout"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { notify(data.detail || "Не удалось оформить заказ", "error"); return; }
      notify(`Заказ #${data.order_id} успешно оформлен`, "success");
      setItems([]);
      refreshCart();
      setTimeout(() => router.push("/orders"), 1200);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") router.push("/login?reason=session_expired");
      else notify("Ошибка соединения с сервером", "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const addToCart = async (productId: number) => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    try {
      await apiFetch(apiUrl("/cart/add"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      refreshCart();
      notify("Товар добавлен в корзину", "success");
    } catch {}
  };

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (loading) return <div className="text-center mt-10 text20">Загрузка корзины...</div>;

  return (
    <div className="min-h-screen py-8">
      <div className="container-main text-black">
        {message && <div className="mb-4"><Toast message={message} type={messageType} /></div>}

        {items.length === 0 ? (
          /* ── ПУСТАЯ КОРЗИНА ── */
          <>
            <div className="flex flex-col items-center py-16 gap-4">
              {/* иконка корзины */}
              <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 24h56l-8 36H28L20 24z" stroke="#222" strokeWidth="2" fill="none"/>
                <line x1="36" y1="52" x2="44" y2="52" stroke="#222" strokeWidth="2"/>
                <circle cx="36" cy="72" r="4" stroke="#222" strokeWidth="2" fill="none"/>
                <circle cx="60" cy="72" r="4" stroke="#222" strokeWidth="2" fill="none"/>
                <path d="M12 16h8l4 8" stroke="#222" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h2 className="text20 font-semibold">В корзине пока пусто</h2>
              <p className="text16 text-[#b5a97a]">
                Загляните на{" "}
                <Link href="/catalog" className="underline">главную</Link>
                {" "}— собрали там товары, которые могут вам понравиться
              </p>
            </div>

            <section>
              <h2 className="h32 mb-6">Подобрали для вас</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {suggested.map((p) => (
                  <article key={p.id} className="bg-[#f3f3f3] border border-black/10 flex flex-col">
                    <Link href={`/product/${p.id}`} className="block">
                      <div className="relative h-40 bg-[#d9d9d9]">
                        <Image src={p.image_url} alt={p.name} fill unoptimized className="object-cover" />
                      </div>
                    </Link>
                    <div className="p-3 flex flex-col flex-1">
                      <p className="text16 text-[#b5a97a] mb-1">{p.price} ₽</p>
                      <p className="text16 font-semibold line-clamp-2 min-h-[40px] mb-2">{p.name}</p>
                      <button
                        onClick={() => addToCart(p.id)}
                        className="w-full border border-black py-1.5 text16 bg-white hover:bg-gray-100 mt-auto"
                      >
                        В корзину
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : (
          /* ── КОРЗИНА С ТОВАРАМИ ── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Левая колонка — товары */}
            <div className="lg:col-span-2 space-y-4">
              <div className="border border-black/15 bg-white">
                <div className="px-5 py-3 border-b border-black/10">
                  <h1 className="text20 font-semibold">Магазин</h1>
                </div>
                {items.map((item, idx) => (
                  <div key={item.id} className={`p-4 ${idx < items.length - 1 ? "border-b border-black/10" : ""}`}>
                    <div className="flex gap-4">
                      <div className="flex items-start pt-1">
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-black" />
                      </div>
                      <div className="relative w-20 h-20 bg-[#d9d9d9] shrink-0">
                        <Image src={item.image_url} alt={item.name} fill unoptimized className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="text16 text-gray-500 mb-0.5">Бренд/знаменитость</p>
                            <p className="text16 font-semibold line-clamp-2">{item.name}</p>
                          </div>
                          <p className="text16 text-[#b5a97a] shrink-0">{item.price} ₽</p>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <button className="w-7 h-7 border border-black/30 flex items-center justify-center text16 hover:bg-gray-100">−</button>
                          <span className="text16 w-6 text-center">{item.quantity}</span>
                          <button className="w-7 h-7 border border-black/30 flex items-center justify-center text16 hover:bg-gray-100">+</button>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <button className="text16 text-gray-400 hover:text-black">♡</button>
                          <button className="text16 text-gray-400 hover:text-black">⊡</button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text16 text-gray-400 hover:text-black"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Доставка */}
              <div className="border border-black/15 bg-white p-5">
                <h2 className="text20 font-semibold mb-1">Доставка в пункт выдачи</h2>
                <p className="text16 text-gray-500 mb-3">Адрес пункта выдачи, время работы</p>
                <p className="text16 font-semibold">Доставка VogueWay | Бесплатно</p>
              </div>
            </div>

            {/* Правая колонка — итог */}
            <div className="space-y-4">
              <div className="border border-black/15 bg-white p-5">
                <h2 className="text20 font-semibold mb-1">Доставка в пункт выдачи</h2>
                <p className="text16 text-gray-500 mb-4">Адрес пункта выдачи, время работы</p>

                <p className="text16 font-semibold mb-2">Оплата картой</p>
                <div className="flex mb-4">
                  <button className="flex-1 py-1.5 text16 bg-black text-white">При получении</button>
                  <button className="flex-1 py-1.5 text16 border border-black bg-white hover:bg-gray-50">Сразу</button>
                </div>

                <div className="flex justify-between text16 mb-1">
                  <span>Товары, {totalCount} шт.</span>
                  <span>{totalPrice} ₽</span>
                </div>
                <div className="flex justify-between text16 text-gray-400 mb-4">
                  <span>Моя скидка</span>
                  <span>Расчёт скидки</span>
                </div>
                <div className="flex justify-between text20 font-semibold mb-5">
                  <span>Итого</span>
                  <span>{totalPrice} ₽</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className={`w-full py-3 text20 border border-black ${checkoutLoading ? "bg-gray-400 text-white" : "bg-black text-white hover:bg-gray-900"}`}
                >
                  {checkoutLoading ? "Оформляем..." : "Заказать"}
                </button>
                <p className="text-center text16 text-gray-400 mt-3">
                  Соглашаюсь с правилами пользования торговой площадкой и возврата
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Секция "С этим товаром покупают" — только когда корзина не пустая */}
        {items.length > 0 && suggested.length > 0 && (
          <section className="mt-12">
            <h2 className="h32 mb-6">С этим товаром покупают</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {suggested.map((p) => (
                <article key={p.id} className="bg-[#f3f3f3] border border-black/10 flex flex-col">
                  <Link href={`/product/${p.id}`} className="block">
                    <div className="relative h-40 bg-[#d9d9d9]">
                      <Image src={p.image_url} alt={p.name} fill unoptimized className="object-cover" />
                    </div>
                  </Link>
                  <div className="p-3 flex flex-col flex-1">
                    <p className="text16 text-[#b5a97a] mb-1">{p.price} ₽</p>
                    <p className="text16 font-semibold line-clamp-2 min-h-[40px] mb-2">{p.name}</p>
                    <button
                      onClick={() => addToCart(p.id)}
                      className="w-full border border-black py-1.5 text16 bg-white hover:bg-gray-100 mt-auto"
                    >
                      В корзину
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
