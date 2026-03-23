"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import Toast from "@/app/components/Toast";
import { useCart } from "@/lib/CartContext";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

const BRAND_META: Record<string, { name: string; image: string; description: string }> = {
  recrent: {
    name: "Recrent",
    image: "/images/celebrities/recrent.jpg",
    description: "Российский streetwear бренд. Одежда и аксессуары с уникальными принтами.",
  },
};

export default function BrandPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { refreshCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const slug = Array.isArray(params?.slug) ? params.slug[0] : (params?.slug ?? "");
  const brand = BRAND_META[slug];

  useEffect(() => {
    if (!slug) return;
    if (!BRAND_META[slug]) { router.push("/celebrities"); return; }
    setLoading(true);
    fetch(apiUrl("/products?search=Recrent"))
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(data))
      .catch(() => { setToast("Ошибка загрузки товаров. Проверьте соединение."); setToastType("error"); })
      .finally(() => setLoading(false));
  }, [slug]);

  const addToCart = async (productId: number) => {
    const token = localStorage.getItem("token");
    if (!token) { setToast("Войдите в аккаунт"); setToastType("error"); return; }
    try {
      const res = await apiFetch(apiUrl("/cart/add"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      if (res.ok) { setToast("Товар добавлен в корзину"); setToastType("success"); refreshCart(); }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") router.push("/login?reason=session_expired");
    }
  };

  if (!brand) return null;

  return (
    <div className="min-h-screen py-8">
      <div className="container-main text-black">

        {toast && <div className="mb-4"><Toast message={toast} type={toastType} /></div>}

        {/* Шапка бренда */}
        <div className="flex items-center gap-6 mb-10 border border-black/10 bg-[#f3f3f3] p-6">
          <div className="relative w-24 h-24 shrink-0 bg-[#d9d9d9] border border-black/10 overflow-hidden">
            <Image src={brand.image} alt={brand.name} fill unoptimized className="object-cover" />
          </div>
          <div>
            <h1 className="h32 mb-1">{brand.name}</h1>
            <p className="text16 text-gray-500">{brand.description}</p>
            <Link href="/celebrities" className="text16 text-gray-400 hover:underline mt-1 inline-block">
              ← Все знаменитости
            </Link>
          </div>
        </div>

        {/* Товары */}
        {loading ? (
          <p className="text20 text-center">Загрузка...</p>
        ) : products.length === 0 ? (
          <p className="text20 text-center text-gray-500">Товары не найдены</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <article key={product.id} className="bg-[#d9d9d9] border border-black/10 overflow-hidden text-black flex flex-col">
                <Link href={`/product/${product.id}`} className="block">
                  <div className="relative w-full h-64 bg-[#cfcfcf]">
                    <Image src={product.image_url} alt={product.name} fill unoptimized className="object-cover" />
                  </div>
                </Link>
                <div className="p-4 bg-[#f3f3f3] flex flex-col flex-1">
                  <p className="text16 text-[#e9e7bf] mb-1">{product.price} ₽</p>
                  <Link href={`/product/${product.id}`} className="block mb-1">
                    <h2 className="text16 font-semibold hover:underline line-clamp-2 min-h-[44px]">{product.name}</h2>
                  </Link>
                  <p className="text16 text-gray-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="w-full border border-black py-2 text16 bg-white hover:bg-gray-100 transition mt-auto"
                  >
                    В корзину
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
