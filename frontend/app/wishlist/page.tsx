"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import Toast from "@/app/components/Toast";
import WishlistHeart from "@/app/components/WishlistHeart";
import { useWishlist } from "@/lib/useWishlist";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id?: number | null;
}

export default function WishlistPage() {
  const router = useRouter();
  const { refresh: refreshWishlistIds } = useWishlist();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [authMissing, setAuthMissing] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const loadItems = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthMissing(true);
      setItems([]);
      setLoading(false);
      return;
    }
    setAuthMissing(false);
    setLoading(true);
    try {
      const res = await apiFetch(apiUrl("/wishlist"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems(await res.json());
      } else {
        setToast("Не удалось загрузить избранное");
        setToastType("error");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") {
        router.push("/login?reason=session_expired");
      } else {
        setToast("Ошибка сети");
        setToastType("error");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const removeItem = async (productId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const snapshot = items;
    setItems((rows) => rows.filter((p) => p.id !== productId));
    try {
      const res = await apiFetch(apiUrl(`/wishlist/${productId}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        void refreshWishlistIds();
      } else {
        setItems(snapshot);
        setToast("Не удалось убрать из избранного");
        setToastType("error");
      }
    } catch {
      setItems(snapshot);
      setToast("Ошибка сети");
      setToastType("error");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10 text20">Загрузка избранного...</div>
    );
  }

  if (authMissing) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-main max-w-3xl bg-white p-8 border border-black/20 text-center">
          <h1 className="h32 mb-3">Избранное</h1>
          <p className="text20 mb-4">Войдите, чтобы видеть сохранённые товары.</p>
          <Link href="/login" className="text20 underline">
            Перейти ко входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-main text-black">
        <h1 className="h32 mb-2">Избранное</h1>
        <p className="text16 text-gray-600 mb-6 inline-flex items-center gap-2">
          <Image src="/favorites-icon.png" alt="" width={16} height={16} />
          <span>Товары, которые вы отметили на карточках в каталоге.</span>
        </p>

        {toast && (
          <div className="mb-4">
            <Toast message={toast} type={toastType} />
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white p-8 border border-black/20 text-center">
            <p className="text20 mb-4">Пока пусто.</p>
            <Link href="/catalog" className="text20 underline">
              В каталог
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {items.map((product) => (
              <article
                key={product.id}
                className="bg-[#d9d9d9] border border-black/10 overflow-hidden flex flex-col"
              >
                <div className="relative w-full h-64 bg-[#cfcfcf]">
                  <Link href={`/product/${product.id}`} className="block absolute inset-0">
                    {product.image_url && (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    )}
                  </Link>
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      type="button"
                      onClick={() => void removeItem(product.id)}
                      aria-label="Удалить из избранного"
                      className="w-8 h-8 rounded-full bg-white/90 border border-black/15 flex items-center justify-center hover:bg-white"
                    >
                      <Image src="/delete-icon.png" alt="" width={14} height={14} />
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-[#f3f3f3] flex flex-col flex-1">
                  <p className="text16 text-black mb-1">{product.price} ₽</p>
                  <Link href={`/product/${product.id}`} className="block mb-1">
                    <h2 className="text16 font-semibold hover:underline line-clamp-2 min-h-[44px]">
                      {product.name}
                    </h2>
                  </Link>
                  {product.description && (
                    <p className="text16 text-gray-500 line-clamp-2 mb-4 flex-1">
                      {product.description}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
