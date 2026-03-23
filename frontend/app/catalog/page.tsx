"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const notify = (text: string, type: "success" | "error") => {
    setToastMessage(text);
    setToastType(type);
  };

  const fetchProducts = async (search?: string) => {
    setLoading(true);
    try {
      const url = search ? apiUrl(`/products?search=${encodeURIComponent(search)}`) : apiUrl("/products");
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Ошибка загрузки:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const search = searchParams.get("search") ?? undefined;
    fetchProducts(search);
  }, [searchParams]);

  const handleReset = () => {
    router.push("/catalog");
  };

  const handlePhotoSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    setIsAiSearching(true);
    try {
      const response = await fetch(apiUrl("/ai/search"), { method: "POST", body: formData });
      if (response.ok) {
        setProducts(await response.json());
        notify("ИИ-ассистент подобрал похожие товары!", "success");
      } else {
        notify("Ошибка при анализе фото", "error");
      }
    } catch (error) {
      console.error("AI Search error:", error);
    } finally {
      setIsAiSearching(false);
    }
  };

  const addToCart = async (productId: number) => {
    const token = localStorage.getItem("token");
    if (!token) { notify("Войдите в аккаунт, чтобы добавить товар в корзину", "error"); return; }
    try {
      const response = await apiFetch(apiUrl("/cart/add"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      if (response.ok) {
        notify("Товар добавлен в корзину", "success");
        refreshCart();
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") {
        notify("Сессия истекла, войдите снова", "error");
      } else {
        console.error(err);
      }
    }
  };

  const searchTerm = searchParams.get("search");

  if (loading) return <div className="text-center mt-10 text20">Загрузка каталога...</div>;

  return (
    <div className="min-h-screen py-8">
      <div className="container-main">
        {toastMessage && (
          <div className="mb-4"><Toast message={toastMessage} type={toastType} /></div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="h32">Каталог</h1>
            {searchTerm && (
              <p className="text16 text-gray-600 mt-1">
                Результаты по запросу: «{searchTerm}» — {products.length} товаров
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handleReset} className="text16 border border-black px-4 py-2 bg-white">
              Сбросить всё
            </button>
            <label className={`cursor-pointer flex items-center gap-2 px-6 py-3 border border-black text16 transition ${isAiSearching ? "bg-gray-300" : "bg-black text-white"}`}>
              <span>{isAiSearching ? "ИИ думает..." : "Поиск по фото"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSearch} disabled={isAiSearching} />
            </label>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text20 text-gray-600 mb-4">Ничего не найдено</p>
            <button onClick={handleReset} className="text16 underline">Показать все товары</button>
          </div>
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

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10 text20">Загрузка каталога...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
