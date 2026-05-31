"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import CheckoutSteps from "@/app/components/CheckoutSteps";
import { CheckoutPageSkeleton } from "@/app/components/ProductGridSkeleton";
import { useCart } from "@/lib/CartContext";
import { useToast } from "@/lib/ToastContext";
import { formatPrice } from "@/lib/format";
import { formatPhoneInput, phoneDigits } from "@/lib/phone";
import {
  validateCheckoutForm,
  type CheckoutField,
  type CheckoutFieldErrors,
} from "@/lib/checkout-validation";
import { pageCard, pageCardPadded, pageOutlineButton, pageShell, uiForm } from "@/lib/ui";
import { pageContent, pageCtaPrimary, pageSummaryCard } from "@/lib/page-classes";
import { PageHero } from "@/app/components/PageHero";
import { DeliveryProgress } from "@/app/components/DeliveryProgress";
import { publicImageSrc } from "@/lib/image-src";

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  size?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { refreshCart } = useCart();
  const { showToast } = useToast();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [payMethod, setPayMethod] = useState<"pickup" | "online">("pickup");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoValidating, setPromoValidating] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<CheckoutField, boolean>>>({});

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

    apiFetch(apiUrl("/auth/profile"), { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.ok) {
          const profile = await res.json();
          setLoyaltyPoints(Number(profile.loyalty_points) || 0);
          if (profile.full_name) {
            setFullName((prev) => prev || profile.full_name);
          }
        }
      })
      .catch(() => {});
  }, [router]);

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const finalTotal = Math.max(0, totalPrice - promoDiscount);
  const pointsToEarn = Math.floor(finalTotal * 0.01);

  const validatePromo = async (code: string, subtotal: number) => {
    const trimmed = code.trim();
    if (!trimmed) {
      setPromoDiscount(0);
      setPromoApplied(null);
      setPromoError("");
      return;
    }
    setPromoValidating(true);
    setPromoError("");
    try {
      const params = new URLSearchParams({
        code: trimmed,
        subtotal: String(subtotal),
      });
      const res = await fetch(apiUrl(`/promo/validate?${params}`));
      const data = await res.json();
      if (!res.ok) {
        setPromoDiscount(0);
        setPromoApplied(null);
        setPromoError(typeof data.detail === "string" ? data.detail : "Промокод недействителен");
        return;
      }
      setPromoDiscount(Number(data.discount) || 0);
      setPromoApplied(data.code ?? trimmed);
      setPromoError("");
    } catch {
      setPromoError("Не удалось проверить промокод");
    } finally {
      setPromoValidating(false);
    }
  };

  const handlePromoBlur = () => {
    void validatePromo(promoCode, totalPrice);
  };

  const inputClass = (field: CheckoutField) =>
    `${uiForm.input} ${fieldErrors[field] && touched[field] ? uiForm.inputError : ""}`;

  const markTouched = (field: CheckoutField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async () => {
    const errors = validateCheckoutForm(fullName, phone, city, address);
    setFieldErrors(errors);
    setTouched({ fullName: true, phone: true, city: true, address: true });

    if (Object.keys(errors).length > 0) {
      showToast("Проверьте поля формы", "error");
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
          phone: phoneDigits(phone),
          city: city.trim(),
          address: address.trim(),
          comment: comment.trim(),
          pay_method: payMethod,
          promo_code: promoApplied || promoCode.trim() || null,
        }),
      });
      let data: { detail?: string | { msg?: string }[]; order_id?: number; loyalty_points_earned?: number } = {};
      try {
        data = await res.json();
      } catch {
        showToast(
          res.ok ? "Не удалось прочитать ответ сервера" : `Ошибка сервера (${res.status})`,
          "error"
        );
        return;
      }
      if (!res.ok) {
        const detail = data.detail;
        const message =
          typeof detail === "string"
            ? detail
            : Array.isArray(detail)
              ? detail.map((d) => d.msg ?? String(d)).join(", ")
              : "Не удалось оформить заказ";
        showToast(message, "error");
        return;
      }
      showToast(
        data.loyalty_points_earned
          ? `Заказ #${data.order_id} оформлен · +${data.loyalty_points_earned} баллов`
          : `Заказ #${data.order_id} успешно оформлен`,
        "success"
      );
      refreshCart();
      setTimeout(() => router.push("/orders"), 1200);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") {
        router.push("/login?reason=session_expired");
      } else {
        showToast("Ошибка соединения с сервером", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <CheckoutPageSkeleton />;

  if (items.length === 0) {
    return (
      <div className={pageShell}>
        <div className="container-main text-center text-black py-16">
          <CheckoutSteps current="checkout" />
          <h1 className="h32 mb-4">Корзина пуста</h1>
          <p className="text16 text-gray-500 mb-6">Добавьте товары, чтобы оформить заказ</p>
          <Link
            href="/catalog"
            className="inline-block rounded-md bg-black px-6 py-3 text16 text-white hover:bg-black/90"
          >
            Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={pageShell}>
      <div className={`${pageContent} pt-8 sm:pt-10 text-black dark:text-[var(--foreground)]`}>
        <CheckoutSteps current="checkout" />

        <div className="mb-4">
          <Link href="/cart" className="text-sm text-neutral-500 transition hover:text-neutral-900 dark:hover:text-white">
            ← Вернуться в корзину
          </Link>
        </div>

        <PageHero
          eyebrow="Checkout"
          title="Оформление заказа"
          description="Заполните адрес доставки — мы соберём заказ и отправим уведомление на почту."
          variant="light"
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className={`rounded-2xl ${pageCardPadded}`}>
              <h2 className="text20 font-semibold mb-4">Адрес доставки</h2>
              <div className="space-y-4">
                <div>
                  <label className={uiForm.label}>
                    ФИО получателя <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (touched.fullName) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          fullName: validateCheckoutForm(e.target.value, phone, city, address).fullName,
                        }));
                      }
                    }}
                    onBlur={() => markTouched("fullName")}
                    placeholder="Иванов Иван Иванович"
                    className={inputClass("fullName")}
                    aria-invalid={!!fieldErrors.fullName}
                  />
                  {touched.fullName && fieldErrors.fullName && (
                    <p className={uiForm.error}>{fieldErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className={uiForm.label}>
                    Телефон <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const formatted = formatPhoneInput(e.target.value);
                      setPhone(formatted);
                      if (touched.phone) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          phone: validateCheckoutForm(fullName, formatted, city, address).phone,
                        }));
                      }
                    }}
                    onBlur={() => markTouched("phone")}
                    placeholder="+7 (999) 123-45-67"
                    className={inputClass("phone")}
                    aria-invalid={!!fieldErrors.phone}
                  />
                  {touched.phone && fieldErrors.phone && (
                    <p className={uiForm.error}>{fieldErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className={uiForm.label}>
                    Город <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (touched.city) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          city: validateCheckoutForm(fullName, phone, e.target.value, address).city,
                        }));
                      }
                    }}
                    onBlur={() => markTouched("city")}
                    placeholder="Москва"
                    className={inputClass("city")}
                    aria-invalid={!!fieldErrors.city}
                  />
                  {touched.city && fieldErrors.city && (
                    <p className={uiForm.error}>{fieldErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className={uiForm.label}>
                    Адрес <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (touched.address) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          address: validateCheckoutForm(fullName, phone, city, e.target.value).address,
                        }));
                      }
                    }}
                    onBlur={() => markTouched("address")}
                    placeholder="ул. Пушкина, д. 10, кв. 5"
                    className={inputClass("address")}
                    aria-invalid={!!fieldErrors.address}
                  />
                  {touched.address && fieldErrors.address && (
                    <p className={uiForm.error}>{fieldErrors.address}</p>
                  )}
                </div>

                <div>
                  <label className={uiForm.label}>Комментарий к заказу</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Дополнительная информация для курьера"
                    rows={3}
                    className={`${uiForm.input} resize-none`}
                  />
                </div>
              </div>
            </div>

            <div className={`rounded-2xl ${pageCardPadded}`}>
              <h2 className="text20 font-semibold mb-1">Способ доставки</h2>
              <p className="text16 text-gray-500 mb-2">Курьерская доставка по указанному адресу</p>
              <p className="text16 font-semibold">Доставка VogueWay | Бесплатно</p>
            </div>

            <div className={`overflow-hidden rounded-2xl ${pageCard}`}>
              <div className="border-b border-black/10 px-5 py-3">
                <h2 className="text20 font-semibold">Товары в заказе ({totalCount})</h2>
              </div>
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 ${idx < items.length - 1 ? "border-b border-black/10" : ""}`}
                >
                  <div className="flex gap-4">
                    <div className="relative h-16 w-16 shrink-0 bg-[#d9d9d9]">
                      <Image src={publicImageSrc(item.image_url)} alt={item.name} fill unoptimized className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text16 font-semibold line-clamp-2">{item.name}</p>
                      {item.size ? (
                        <p className="text14 text-gray-500">Размер: {item.size}</p>
                      ) : null}
                      <div className="mt-1 flex justify-between">
                        <span className="text16 text-gray-500">{item.quantity} шт.</span>
                        <span className="text16 font-semibold">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <DeliveryProgress subtotal={totalPrice} />
            <div className={pageSummaryCard}>
              <h2 className="text20 font-semibold mb-4">Ваш заказ</h2>
              <p className="text16 font-semibold mb-2">Способ оплаты</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPayMethod("pickup")}
                    className={`flex-1 rounded-full py-2 text-sm ${
                      payMethod === "pickup"
                        ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                        : pageOutlineButton
                    }`}
                  >
                    При получении
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod("online")}
                    className={`flex-1 rounded-full py-2 text-sm ${
                      payMethod === "online"
                        ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                        : pageOutlineButton
                    }`}
                  >
                    Онлайн
                  </button>
                </div>
              <div className="mb-4 space-y-1">
                <div className="flex justify-between text16">
                  <span>Товары, {totalCount} шт.</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text16">
                  <span>Доставка</span>
                  <span className="text-green-600">Бесплатно</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text16 text-green-700">
                    <span>Скидка{promoApplied ? ` (${promoApplied})` : ""}</span>
                    <span>−{formatPrice(promoDiscount)}</span>
                  </div>
                )}
              </div>

              <div className="mb-4 rounded-xl border border-neutral-200/90 bg-neutral-50/80 p-3 dark:border-neutral-700 dark:bg-neutral-900/40">
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Программа лояльности
                </p>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">На счёте</span>
                  <span className="font-semibold">{loyaltyPoints} баллов</span>
                </div>
                {pointsToEarn > 0 && (
                  <div className="mt-1 flex justify-between text-sm text-emerald-700 dark:text-emerald-400">
                    <span>За этот заказ</span>
                    <span className="font-semibold">+{pointsToEarn}</span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className={uiForm.label}>Промокод</label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  onBlur={handlePromoBlur}
                  placeholder="WELCOME10"
                  className={uiForm.input}
                  aria-invalid={!!promoError}
                />
                <p className="mt-1.5 text-xs text-neutral-500">
                  Промокоды:{" "}
                  <button type="button" className="font-semibold underline" onClick={() => { setPromoCode("WELCOME10"); void validatePromo("WELCOME10", totalPrice); }}>WELCOME10</button>
                  {" "}(−10%) или{" "}
                  <button type="button" className="font-semibold underline" onClick={() => { setPromoCode("SAVE500"); void validatePromo("SAVE500", totalPrice); }}>SAVE500</button>
                  {" "}(−500 ₽ от 3000 ₽)
                </p>
                {promoValidating && (
                  <p className="mt-1 text14 text-gray-400">Проверка...</p>
                )}
                {promoError && (
                  <p className={uiForm.error}>{promoError}</p>
                )}
                {promoApplied && !promoError && promoDiscount > 0 && (
                  <p className="mt-1 text14 text-green-600">Промокод применён</p>
                )}
              </div>
              <div className="mb-5 flex justify-between border-t border-black/10 pt-3 text20 font-semibold">
                <span>Итого</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                aria-busy={submitting}
                className={pageCtaPrimary}
              >
                {submitting ? "Оформляем..." : "Оформить заказ"}
              </button>
              <p className="mt-3 text-center text14 text-gray-400">
                Нажимая кнопку, вы соглашаетесь с правилами пользования площадкой
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
