"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
      <div className="text-center mt-10 text-black">Загрузка каталога...</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h1 className="text-4xl font-black text-black tracking-tight">
            Каталог
          </h1>

          <div className="flex items-center gap-4">
            {/* Кнопка сброса фильтра */}
            <button
              onClick={fetchProducts}
              className="text-sm text-gray-500 hover:text-black transition"
            >
              Сбросить всё
            </button>

            {/* ИИ Поиск */}
            <label
              className={`cursor-pointer flex items-center gap-2 px-6 py-3 rounded-full font-bold transition shadow-lg ${
                isAiSearching
                  ? "bg-gray-400"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105"
              }`}
            >
              <span>{isAiSearching ? "ИИ думает..." : "✨ Поиск по фото"}</span>
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
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 text-black group"
            >
              <div className="relative w-full h-64 bg-gray-200">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="p-5">
                <h2 className="text-xl font-bold mb-1">{product.name}</h2>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-black text-blue-600">
                    {product.price} ₽
                  </span>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="bg-black text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition"
                  >
                    В корзину
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
