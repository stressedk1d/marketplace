"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiUrl } from "@/lib/api";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAiSearching, setIsAiSearching] = useState(false);

  // Загрузка всех товаров
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/products"));
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Ошибка загрузки:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Функция ИИ-поиска по фото
  const handlePhotoSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setIsAiSearching(true);
    try {
      const response = await fetch(apiUrl("/ai/search"), {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data); // Обновляем каталог результатами от ИИ
        alert("ИИ-ассистент подобрал похожие товары!");
      } else {
        alert("Ошибка при анализе фото");
      }
    } catch (error) {
      console.error("AI Search error:", error);
    } finally {
      setIsAiSearching(false);
    }
  };

  const addToCart = async (productId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Пожалуйста, войдите в аккаунт");
      return;
    }

    try {
      const response = await fetch(apiUrl("/cart/add"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });

      if (response.ok) {
        alert("Товар добавлен в корзину!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-10 text20">Загрузка каталога...</div>
    );

  return (
    <div className="min-h-screen py-8">
      <div className="container-main">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h1 className="h32">Каталог</h1>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchProducts}
              className="text16 border border-black px-4 py-2 bg-white"
            >
              Сбросить всё
            </button>

            <label
              className={`cursor-pointer flex items-center gap-2 px-6 py-3 border border-black text16 transition ${
                isAiSearching ? "bg-gray-300" : "bg-black text-white"
              }`}
            >
              <span>{isAiSearching ? "ИИ думает..." : "Поиск по фото"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSearch}
                disabled={isAiSearching}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <article
              key={product.id}
              className="bg-[#d9d9d9] border border-black/10 overflow-hidden text-black"
            >
              <Link href={`/product/${product.id}`} className="block">
                <div className="relative w-full h-64 bg-[#cfcfcf]">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              </Link>

              <div className="p-4 bg-[#f3f3f3]">
                <p className="text20 text-[#e9e7bf]">Цена: {product.price} ₽</p>
                <p className="text20">Бренд/знаменитость</p>
                <Link href={`/product/${product.id}`} className="inline-block">
                  <h2 className="text20 font-semibold mb-1 hover:underline">{product.name}</h2>
                </Link>
                <p className="text16 text-gray-700 line-clamp-2 mb-4 h-12">
                  {product.description}
                </p>
                <button
                  onClick={() => addToCart(product.id)}
                  className="w-full border border-black py-2 text20 bg-white hover:bg-gray-100 transition"
                >
                  В корзину
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
