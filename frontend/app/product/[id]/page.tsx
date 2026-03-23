"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { apiUrl } from "@/lib/api";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const productId = Number(params.id);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(apiUrl("/products"));
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Product page fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const product = useMemo(
    () => products.find((item) => item.id === productId),
    [products, productId]
  );

  const similarProducts = useMemo(
    () => products.filter((item) => item.id !== productId).slice(0, 6),
    [products, productId]
  );

  const addToCart = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Пожалуйста, войдите в аккаунт");
      return;
    }

    setAdding(true);
    try {
      const response = await fetch(apiUrl("/cart/add"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: id, quantity: 1 }),
      });

      if (response.ok) {
        alert("Товар добавлен в корзину");
      } else {
        alert("Не удалось добавить товар");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="container-main py-10 text20">Загрузка товара...</div>;
  }

  if (!product) {
    return (
      <div className="container-main py-10">
        <h1 className="h32 mb-4">Товар не найден</h1>
        <Link href="/catalog" className="text20 underline">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-main text-black">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <section className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative h-[380px] bg-[#d9d9d9] border border-black/10">
                <Image src={product.image_url} alt={product.name} fill unoptimized className="object-cover" />
              </div>
              <div className="relative h-[380px] bg-[#d9d9d9] border border-black/10">
                <Image src={product.image_url} alt={product.name} fill unoptimized className="object-cover opacity-85" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="relative h-40 bg-[#d9d9d9] border border-black/10">
                  <Image src={product.image_url} alt={product.name} fill unoptimized className="object-cover opacity-80" />
                </div>
              ))}
            </div>
          </section>

          <aside className="border border-black/20 p-5 bg-[#f3f3f3] h-fit">
            <h1 className="h32 mb-2">Бренд/знаменитость</h1>
            <p className="text20 mb-6">{product.name}</p>
            <p className="h32 mb-6">{product.price} ₽</p>

            <button type="button" className="w-full text16 border border-black py-2 bg-white mb-3">
              Выбрать размер
            </button>

            <button
              type="button"
              onClick={() => addToCart(product.id)}
              disabled={adding}
              className={`w-full py-3 text24 border border-black ${
                adding ? "bg-gray-300" : "bg-black text-white hover:bg-gray-900"
              }`}
            >
              {adding ? "Добавляем..." : "В корзину"}
            </button>

            <p className="text20 mt-6">Доставка в г.Москва</p>
          </aside>
        </div>

        <section className="mb-10">
          <div className="flex gap-8 mb-4">
            <h2 className="h32">О товаре</h2>
            <h2 className="h32">О бренде</h2>
            <h2 className="h32">Отзывы</h2>
          </div>
          <p className="text20 max-w-4xl mb-4">
            {product.description || "Описание товара будет добавлено продавцом."}
          </p>
          <p className="text20 max-w-4xl mb-4">
            Материал, посадка, рекомендации по уходу и основные характеристики отображаются в этом блоке.
          </p>
          <p className="text20 max-w-4xl">
            Бренд/знаменитость: коллекция, сезон, особенности и совместимые товары.
          </p>
        </section>

        <section>
          <h2 className="h32 mb-5">Похожие</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {similarProducts.map((item) => (
              <article key={item.id} className="bg-[#f3f3f3] border border-black/15">
                <Link href={`/product/${item.id}`} className="block">
                  <div className="relative h-44 bg-[#d9d9d9]">
                    <Image src={item.image_url} alt={item.name} fill unoptimized className="object-cover" />
                  </div>
                </Link>
                <div className="p-3">
                  <p className="text16 text-[#e9e7bf]">Цена</p>
                  <p className="text20">Бренд/знаменитость</p>
                  <p className="text20 line-clamp-1 mb-2">{item.name}</p>
                  <button
                    type="button"
                    onClick={() => addToCart(item.id)}
                    className="w-full border border-black py-1.5 text20 bg-white hover:bg-gray-100"
                  >
                    В корзину
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
