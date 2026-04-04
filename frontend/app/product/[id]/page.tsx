"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import Toast from "@/app/components/Toast";
import WishlistHeart from "@/app/components/WishlistHeart";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/useWishlist";
import { recordProductView } from "@/lib/recently-viewed";

interface BrandBrief {
  id: number;
  name: string;
  slug: string;
  is_celebrity?: boolean;
}

interface CollectionBrief {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  brand?: BrandBrief | null;
  collection?: CollectionBrief | null;
}

interface ProductListResponse {
  items: Product[];
  total: number;
  limit: number;
  offset: number;
}

// Строит массив всех изображений товара по префиксу папки
// image_url: /images/products/rekrent-hoodie-black/rekrent-hoodie-black.png
// доп. фото:  /images/products/rekrent-hoodie-black/rekrent-hoodie-black1.webp, ...2.webp и т.д.
const EXTRA_IMAGES: Record<string, string[]> = {
  "rekrent-hoodie-black":    ["rekrent-hoodie-black1.webp", "rekrent-hoodie-black2.webp"],
  "rekrent-hoodie-white":    ["rekrent-hoodie-white1.webp", "rekrent-hoodie-white2.webp", "rekrent-hoodie-white3.webp"],
  "rekrent-necklace":        ["rekrent-necklace1.webp"],
  "rekrent-sleeves-black":   ["rekrent-sleeves-black1.webp", "rekrent-sleeves-black2.webp"],
  "rekrent-sleeves-white":   ["rekrent-sleeves-white1.webp", "rekrent-sleeves-white2.webp"],
  "rekrent-tee-dragon-black":["rekrent-tee-dragon-black1.webp", "rekrent-tee-dragon-black2.webp"],
  "rekrent-tee-dragon-white":["rekrent-tee-dragon-white1.webp", "rekrent-tee-dragon-white2.webp"],
  "rekrent-tee-logo-black":  ["rekrent-tee-logo-black1.webp", "rekrent-tee-logo-black2.webp"],
  "rekrent-tee-logo-white":  ["rekrent-tee-logo-white1.webp", "rekrent-tee-logo-white2.webp"],
};

function getProductImages(imageUrl: string): string[] {
  // Извлекаем папку: /images/products/rekrent-hoodie-black/...  → rekrent-hoodie-black
  const folder = imageUrl.split("/").slice(-2, -1)[0];
  const extras = (EXTRA_IMAGES[folder] ?? []).map(
    (f) => `/images/products/${folder}/${f}`
  );
  return [imageUrl, ...extras];
}

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartMessageType, setCartMessageType] = useState<"success" | "error">("success");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const { refreshCart } = useCart();
  const { ids: wishlistIds, toggle: toggleWishlist } = useWishlist();

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeLightbox(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeLightbox]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [productRes, allRes] = await Promise.all([
          fetch(apiUrl(`/products/${params.id}`)),
          fetch(apiUrl("/products?limit=50&offset=0")),
        ]);
        if (productRes.ok) setProduct(await productRes.json());
        if (allRes.ok) {
          const payload: ProductListResponse = await allRes.json();
          const all = payload.items;
          setSimilar(all.filter((p) => p.id !== Number(params.id)).slice(0, 6));
        }
      } catch (err) {
        console.error("Product page fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  useEffect(() => {
    if (!product) return;
    recordProductView({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url ?? null,
    });
  }, [product]);

  const addToCart = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCartMessage("Войдите в аккаунт, чтобы добавить товар в корзину");
      setCartMessageType("error");
      return;
    }
    setAdding(true);
    try {
      const res = await apiFetch(apiUrl("/cart/add"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: id, quantity: 1 }),
      });
      if (res.ok) {
        setCartMessage("Товар добавлен в корзину");
        setCartMessageType("success");
        refreshCart();
      } else {
        setCartMessage("Не удалось добавить товар");
        setCartMessageType("error");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") {
        setCartMessage("Сессия истекла, войдите снова");
        setCartMessageType("error");
      }
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="container-main py-10 text20">Загрузка товара...</div>;

  if (!product) return (
    <div className="container-main py-10">
      <h1 className="h32 mb-4">Товар не найден</h1>
      <Link href="/catalog" className="text20 underline">Вернуться в каталог</Link>
    </div>
  );

  return (
    <>
      <div className="min-h-screen py-8">
        <div className="container-main text-black">

          {cartMessage && (
            <div className="mb-4">
              <Toast message={cartMessage} type={cartMessageType} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <section className="lg:col-span-2">
              {(() => {
                const imgs = getProductImages(product.image_url);
                const [main, ...rest] = imgs;
                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div onClick={() => setLightbox(main)} className="relative h-[380px] bg-[#d9d9d9] border border-black/10 cursor-zoom-in">
                        <Image src={main} alt={product.name} fill unoptimized className="object-cover" />
                      </div>
                      <div onClick={() => setLightbox(rest[0] ?? main)} className="relative h-[380px] bg-[#d9d9d9] border border-black/10 cursor-zoom-in">
                        <Image src={rest[0] ?? main} alt={product.name} fill unoptimized className="object-cover" />
                      </div>
                    </div>
                    {rest.length > 1 && (
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        {rest.slice(1).map((src, i) => (
                          <div key={i} onClick={() => setLightbox(src)} className="relative h-40 bg-[#d9d9d9] border border-black/10 cursor-zoom-in">
                            <Image src={src} alt={product.name} fill unoptimized className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </section>

            <aside className="border border-black/20 p-5 bg-[#f3f3f3] h-fit">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="h32">Бренд/знаменитость</h1>
                <WishlistHeart
                  saved={wishlistIds.has(product.id)}
                  onToggle={() =>
                    void toggleWishlist(product.id, () => {
                      setCartMessage("Войдите, чтобы сохранять избранное");
                      setCartMessageType("error");
                    })
                  }
                />
              </div>
              <p className="text20 mb-6">{product.name}</p>
              {product.brand && (
                <p className="text16 text-gray-600 mb-2">
                  {product.brand.is_celebrity ? "Знаменитость" : "Бренд"}:{" "}
                  <Link
                    href={
                      product.brand.is_celebrity
                        ? `/celebrities/${product.brand.slug}`
                        : `/brands/${product.brand.slug}`
                    }
                    className="underline"
                  >
                    {product.brand.name}
                  </Link>
                </p>
              )}
              {product.collection && (
                <p className="text16 text-gray-600 mb-4">
                  Коллекция:{" "}
                  <Link
                    href={`/collections/${product.collection.slug}`}
                    className="underline"
                  >
                    {product.collection.name}
                  </Link>
                </p>
              )}
              <p className="h32 mb-6 text-black">{product.price} ₽</p>
              <button type="button" className="w-full text16 border border-black py-2 bg-white mb-3">
                Выбрать размер
              </button>
              <button
                type="button"
                onClick={() => addToCart(product.id)}
                disabled={adding}
                className={`w-full py-3 text24 border border-black ${adding ? "bg-gray-300" : "bg-black text-white hover:bg-gray-900"}`}
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
            <p className="text20 max-w-4xl mb-4">{product.description || "Описание товара будет добавлено продавцом."}</p>
          </section>

          {similar.length > 0 && (
            <section>
              <h2 className="h32 mb-5">Похожие</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {similar.map((item) => (
                  <article key={item.id} className="bg-[#f3f3f3] border border-black/15 flex flex-col">
                    <div className="relative h-44 bg-[#d9d9d9]">
                      <Link href={`/product/${item.id}`} className="block absolute inset-0">
                        <Image src={item.image_url} alt={item.name} fill unoptimized className="object-cover" />
                      </Link>
                      <div className="absolute top-1.5 right-1.5 z-10">
                        <WishlistHeart
                          size="sm"
                          saved={wishlistIds.has(item.id)}
                          onToggle={() =>
                            void toggleWishlist(item.id, () => {
                              setCartMessage("Войдите, чтобы сохранять избранное");
                              setCartMessageType("error");
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      <p className="text16 font-semibold line-clamp-2 min-h-[44px] mb-1">{item.name}</p>
                      <p className="text16 text-black flex-1 mb-2">{item.price} ₽</p>
                      <button
                        type="button"
                        onClick={() => addToCart(item.id)}
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

      {lightbox && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-zoom-out"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-6 text-white text-4xl leading-none hover:opacity-70"
            aria-label="Закрыть"
          >
            ×
          </button>
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] mx-4">
            <Image src={lightbox} alt="Просмотр" fill unoptimized className="object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
