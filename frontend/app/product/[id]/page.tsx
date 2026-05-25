"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import Breadcrumbs from "@/app/components/Breadcrumbs";
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

interface Review {
  id: number;
  user_id: number;
  user_name: string | null;
  product_id: number;
  rating: number;
  text: string | null;
  created_at: string | null;
}

// Дополнительные изображения галереи по главному image_url товара.
const EXTRA_IMAGES_BY_PRIMARY: Record<string, string[]> = {
  "/images/celebrities/recrent/recrent-hoodie-black/recrent-hoodie-black.png": [
    "/images/celebrities/recrent/recrent-hoodie-black/recrent-hoodie-black1.webp",
    "/images/celebrities/recrent/recrent-hoodie-black/recrent-hoodie-black2.webp",
  ],
  "/images/celebrities/recrent/recrent-hoodie-white/recrent-hoodie-white.png": [
    "/images/celebrities/recrent/recrent-hoodie-white/recrent-hoodie-white1.webp",
    "/images/celebrities/recrent/recrent-hoodie-white/recrent-hoodie-white2.webp",
    "/images/celebrities/recrent/recrent-hoodie-white/recrent-hoodie-white3.webp",
  ],
  "/images/celebrities/recrent/recrent-necklace/recrent-necklace.png": [
    "/images/celebrities/recrent/recrent-necklace/recrent-necklace1.webp",
  ],
  "/images/celebrities/recrent/recrent-sleeves-black/recrent-sleeves-black.png": [
    "/images/celebrities/recrent/recrent-sleeves-black/recrent-sleeves-black1.webp",
    "/images/celebrities/recrent/recrent-sleeves-black/recrent-sleeves-black2.webp",
  ],
  "/images/celebrities/recrent/recrent-sleeves-white/recrent-sleeves-white.png": [
    "/images/celebrities/recrent/recrent-sleeves-white/recrent-sleeves-white1.webp",
    "/images/celebrities/recrent/recrent-sleeves-white/recrent-sleeves-white2.webp",
  ],
  "/images/celebrities/recrent/recrent-tee-dragon-black/recrent-tee-dragon-black.png": [
    "/images/celebrities/recrent/recrent-tee-dragon-black/recrent-tee-dragon-black1.webp",
    "/images/celebrities/recrent/recrent-tee-dragon-black/recrent-tee-dragon-black2.webp",
  ],
  "/images/celebrities/recrent/recrent-tee-dragon-white/recrent-tee-dragon-white.png": [
    "/images/celebrities/recrent/recrent-tee-dragon-white/recrent-tee-dragon-white1.webp",
    "/images/celebrities/recrent/recrent-tee-dragon-white/recrent-tee-dragon-white2.webp",
  ],
  "/images/celebrities/recrent/recrent-tee-logo-black/recrent-tee-logo-black.png": [
    "/images/celebrities/recrent/recrent-tee-logo-black/recrent-tee-logo-black1.webp",
    "/images/celebrities/recrent/recrent-tee-logo-black/recrent-tee-logo-black2.webp",
  ],
  "/images/celebrities/recrent/recrent-tee-logo-white/recrent-tee-logo-white.png": [
    "/images/celebrities/recrent/recrent-tee-logo-white/recrent-tee-logo-white1.webp",
    "/images/celebrities/recrent/recrent-tee-logo-white/recrent-tee-logo-white2.webp",
  ],
  "/images/brands/adidas/Adidas Gazelle Indoor.webp": [
    "/images/brands/adidas/Adidas Gazelle Indoor1.webp",
    "/images/brands/adidas/Adidas Gazelle Indoor2.webp",
    "/images/brands/adidas/Adidas Gazelle Indoor3.webp",
    "/images/brands/adidas/Adidas Gazelle Indoor4.webp",
  ],
  "/images/brands/adidas/Adidas Adicolor Track Top.webp": [
    "/images/brands/adidas/Adidas Adicolor Track Top1.webp",
    "/images/brands/adidas/Adidas Adicolor Track Top2.webp",
    "/images/brands/adidas/Adidas Adicolor Track Top3.webp",
  ],
  "/images/brands/adidas/Adidas Adicolor SST Pants.jpg": [
    "/images/brands/adidas/Adidas Adicolor SST Pants1.jpg",
    "/images/brands/adidas/Adidas Adicolor SST Pants2.jpg",
    "/images/brands/adidas/Adidas Adicolor SST Pants3.jpg",
    "/images/brands/adidas/Adidas Adicolor SST Pants 5.png",
  ],
  "/images/brands/adidas/Adidas Forum Low.webp": [
    "/images/brands/adidas/Adidas Forum Low1.webp",
    "/images/brands/adidas/Adidas Forum Low2.webp",
    "/images/brands/adidas/Adidas Forum Low3.webp",
  ],
  "/images/brands/adidas/Adidas Racer TR23.webp": [
    "/images/brands/adidas/Adidas Racer TR231.webp",
    "/images/brands/adidas/Adidas Racer TR232.webp",
    "/images/brands/adidas/Adidas Racer TR233.webp",
    "/images/brands/adidas/Adidas Racer TR234.webp",
  ],
  "/images/brands/adidas/Adidas Classic Backpack.webp": [
    "/images/brands/adidas/Adidas Classic Backpack1.webp",
    "/images/brands/adidas/Adidas Classic Backpack2.webp",
    "/images/brands/adidas/Adidas Classic Backpack3.webp",
    "/images/brands/adidas/Adidas Classic Backpack4.webp",
    "/images/brands/adidas/Adidas Classic Backpack5.webp",
  ],
  "/images/brands/adidas/Adidas Aeroready Cap.webp": [
    "/images/brands/adidas/Adidas Aeroready Cap2.webp",
    "/images/brands/adidas/Adidas Aeroready Cap3.webp",
    "/images/brands/adidas/Adidas Aeroready Cap4.webp",
  ],
  "/images/brands/adidas/Adidas Essentials Fleece Hoodie.webp": [
    "/images/brands/adidas/Adidas Essentials Fleece Hoodie1.webp",
    "/images/brands/adidas/Adidas Essentials Fleece Hoodie2.webp",
    "/images/brands/adidas/Adidas Essentials Fleece Hoodie3.webp",
    "/images/brands/adidas/Adidas Essentials Fleece Hoodie4.webp",
  ],
  "/images/brands/adidas/Adidas Adilette Comfort.webp": [
    "/images/brands/adidas/Adidas Adilette Comfort1.webp",
    "/images/brands/adidas/Adidas Adilette Comfort2.webp",
    "/images/brands/adidas/Adidas Adilette Comfort3.webp",
    "/images/brands/adidas/Adidas Adilette Comfort4.webp",
    "/images/brands/adidas/Adidas Adilette Comfort5.webp",
  ],
  "/images/brands/converse/Converse Chuck 701.webp": [
    "/images/brands/converse/Converse Chuck 702.webp",
    "/images/brands/converse/Converse Chuck 703.webp",
    "/images/brands/converse/Converse Chuck 704.webp",
    "/images/brands/converse/Converse Chuck 705.webp",
  ],
  "/images/brands/converse/Converse One Star Pro.webp": [
    "/images/brands/converse/Converse One Star Pro2.webp",
  ],
  "/images/brands/converse/Converse Run Star Hike.webp": [
    "/images/brands/converse/Converse Run Star Hike1.webp",
    "/images/brands/converse/Converse Run Star Hike2.webp",
    "/images/brands/converse/Converse Run Star Hike3.webp",
  ],
  "/images/brands/converse/Converse Graphic Hoodie.webp": [
    "/images/brands/converse/Converse Graphic Hoodie1.webp",
    "/images/brands/converse/Converse Graphic Hoodie2.webp",
  ],
  "/images/brands/converse/Converse Tote.webp": [
    "/images/brands/converse/Converse Tote1.webp",
    "/images/brands/converse/Converse Tote2.webp",
  ],
  "/images/brands/converse/Converse Beanie.webp": [
    "/images/brands/converse/Converse Beanie1.webp",
    "/images/brands/converse/Converse Beanie2.webp",
  ],
  "/images/brands/new_balance/New Balance 574 Core.webp": [
    "/images/brands/new_balance/New Balance 574 Core1.webp",
  ],
  "/images/brands/new_balance/New Balance FuelCell Rebel v4.webp": [
    "/images/brands/new_balance/New Balance FuelCell Rebel v41.webp",
    "/images/brands/new_balance/New Balance FuelCell Rebel v42.webp",
  ],
  "/images/brands/new_balance/New Balance Impact Run Short.webp": [
    "/images/brands/new_balance/New Balance Impact Run Short1.webp",
    "/images/brands/new_balance/New Balance Impact Run Short2.webp",
    "/images/brands/new_balance/New Balance Impact Run Short3.webp",
  ],
  "/images/brands/new_balance/New Balance Q Speed Jacquard Tee.webp": [
    "/images/brands/new_balance/New Balance Q Speed Jacquard Tee1.webp",
    "/images/brands/new_balance/New Balance Q Speed Jacquard Tee2.webp",
    "/images/brands/new_balance/New Balance Q Speed Jacquard Tee3.webp",
    "/images/brands/new_balance/New Balance Q Speed Jacquard Tee4.webp",
  ],
  "/images/brands/new_balance/New Balance Heat Grid Half Zip.webp": [
    "/images/brands/new_balance/New Balance Heat Grid Half Zip1.webp",
    "/images/brands/new_balance/New Balance Heat Grid Half Zip2.webp",
    "/images/brands/new_balance/New Balance Heat Grid Half Zip3.webp",
  ],
  "/images/brands/new_balance/New Balance Running Cap.webp": [
    "/images/brands/new_balance/New Balance Running Cap1.webp",
    "/images/brands/new_balance/New Balance Running Cap3.webp",
    "/images/brands/new_balance/New Balance Running Cap4.webp",
  ],
  "/images/brands/new_balance/New Balance Essentials Backpack.webp": [
    "/images/brands/new_balance/New Balance Essentials Backpack1.webp",
    "/images/brands/new_balance/New Balance Essentials Backpack2.webp",
    "/images/brands/new_balance/New Balance Essentials Backpack3.webp",
  ],
  "/images/brands/nike/Nike Air Zoom Pegasus 41.webp": [
    "/images/brands/nike/Nike Air Zoom Pegasus 411.webp",
    "/images/brands/nike/Nike Air Zoom Pegasus 412.webp",
    "/images/brands/nike/Nike Air Zoom Pegasus 413.webp",
    "/images/brands/nike/Nike Air Zoom Pegasus 414.webp",
  ],
  "/images/brands/nike/Nike Dri-FIT Miler Top.webp": [
    "/images/brands/nike/Nike Dri-FIT Miler Top1.webp",
    "/images/brands/nike/Nike Dri-FIT Miler Top2.webp",
    "/images/brands/nike/Nike Dri-FIT Miler Top3.webp",
  ],
  "/images/brands/nike/Nike Challenger Shorts 7.webp": [
    "/images/brands/nike/Nike Challenger Shorts 71.webp",
    "/images/brands/nike/Nike Challenger Shorts 72.webp",
    "/images/brands/nike/Nike Challenger Shorts 73.webp",
    "/images/brands/nike/Nike Challenger Shorts 74.webp",
  ],
  "/images/brands/nike/Nike Club Fleece Hoodie.webp": [
    "/images/brands/nike/Nike Club Fleece Hoodie1.webp",
    "/images/brands/nike/Nike Club Fleece Hoodie2.webp",
    "/images/brands/nike/Nike Club Fleece Hoodie3.webp",
  ],
  "/images/brands/nike/Nike Brasilia Duffel.webp": [
    "/images/brands/nike/Nike Brasilia Duffel1.webp",
    "/images/brands/nike/Nike Brasilia Duffel2.webp",
    "/images/brands/nike/Nike Brasilia Duffel3.webp",
  ],
  "/images/brands/nike/Nike Charge Backpack.webp": [
    "/images/brands/nike/Nike Charge Backpack1.webp",
    "/images/brands/nike/Nike Charge Backpack2.webp",
    "/images/brands/nike/Nike Charge Backpack3.webp",
    "/images/brands/nike/Nike Charge Backpack4.webp",
    "/images/brands/nike/Nike Charge Backpack5.webp",
  ],
  "/images/celebrities/billie-eilish/Billie Tour Tote.webp": [
    "/images/celebrities/billie-eilish/Billie Tour Tote1.webp",
    "/images/celebrities/billie-eilish/Billie Tour Tote2.webp",
    "/images/celebrities/billie-eilish/Billie Tour Tote3.webp",
  ],
};

function getProductImages(imageUrl: string): string[] {
  const extras = EXTRA_IMAGES_BY_PRIMARY[imageUrl] ?? [];
  return [imageUrl, ...extras];
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SHOE_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];

type TabKey = "about" | "brand" | "reviews";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartMessageType, setCartMessageType] = useState<"success" | "error">("success");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("about");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizePickerOpen, setSizePickerOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
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

  useEffect(() => {
    if (!product) return;
    fetch(apiUrl(`/products/${product.id}/reviews`))
      .then(r => r.json())
      .then(data => setReviews(data))
      .catch(() => {});
  }, [product]);

  const submitReview = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCartMessage("Войдите, чтобы оставить отзыв");
      setCartMessageType("error");
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await apiFetch(apiUrl(`/products/${product!.id}/reviews`), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: reviewRating, text: reviewText || null }),
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setReviewText("");
        setReviewRating(5);
        setCartMessage("Отзыв добавлен");
        setCartMessageType("success");
      } else {
        const data = await res.json();
        setCartMessage(data.detail || "Не удалось добавить отзыв");
        setCartMessageType("error");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") {
        setCartMessage("Сессия истекла");
        setCartMessageType("error");
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

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

  const shareProduct = async () => {
    if (!product) return;
    const shareData = {
      title: product.name,
      text: `${product.name} — ${product.price} ₽`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        setCartMessage("Ссылка скопирована");
        setCartMessageType("success");
      }
    } catch {
      // Пользователь мог отменить диалог share — это нормальное поведение.
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
      <div className="min-h-screen py-4 sm:py-8">
        <div className="container-main text-black">

          {cartMessage && (
            <div className="mb-4">
              <Toast message={cartMessage} type={cartMessageType} />
            </div>
          )}

          <Breadcrumbs items={[
            { label: "Каталог", href: "/catalog" },
            { label: product.name },
          ]} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <section className="lg:col-span-2">
              {(() => {
                const imgs = getProductImages(product.image_url);
                const [main, ...rest] = imgs;
                return (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                      <div onClick={() => setLightbox(main)} className="relative h-[min(72vw,380px)] sm:h-[380px] bg-[#d9d9d9] border border-black/10 cursor-zoom-in">
                        <Image src={main} alt={product.name} fill unoptimized sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
                      </div>
                      <div onClick={() => setLightbox(rest[0] ?? main)} className="relative h-[min(72vw,380px)] sm:h-[380px] bg-[#d9d9d9] border border-black/10 cursor-zoom-in">
                        <Image src={rest[0] ?? main} alt={product.name} fill unoptimized sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
                      </div>
                    </div>
                    {rest.length > 1 && (
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:grid-cols-3 sm:gap-4">
                        {rest.slice(1).map((src, i) => (
                          <div key={i} onClick={() => setLightbox(src)} className="relative h-28 sm:h-40 bg-[#d9d9d9] border border-black/10 cursor-zoom-in">
                            <Image src={src} alt={product.name} fill unoptimized className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </section>

            <aside className="h-fit border border-black/20 bg-[#f3f3f3] p-4 sm:p-5">
              <div className="mb-2 flex items-start justify-between gap-3">
                <p className="text16 text-gray-500">Бренд/знаменитость</p>
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
              <h1 className="h32 mb-4 sm:mb-6">{product.name}</h1>
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
              <button
                type="button"
                onClick={() => setSizePickerOpen(!sizePickerOpen)}
                className="w-full text16 border border-black py-2 bg-white mb-1 flex items-center justify-between px-3"
              >
                <span>{selectedSize ? `Размер: ${selectedSize}` : "Выбрать размер"}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" className={`transition-transform ${sizePickerOpen ? "rotate-180" : ""}`}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
              </button>
              {sizePickerOpen && (
                <div className="border border-black/15 bg-white p-3 mb-3">
                  <div className="flex flex-wrap gap-2">
                    {(product.name.toLowerCase().includes("кроссовки") ||
                      product.name.toLowerCase().includes("shoes") ||
                      product.name.toLowerCase().includes("sneaker") ||
                      product.name.toLowerCase().includes("слайды") ||
                      product.name.toLowerCase().includes("gazelle") ||
                      product.name.toLowerCase().includes("forum") ||
                      product.name.toLowerCase().includes("racer") ||
                      product.name.toLowerCase().includes("pegasus") ||
                      product.name.toLowerCase().includes("chuck") ||
                      product.name.toLowerCase().includes("run star") ||
                      product.name.toLowerCase().includes("one star") ||
                      product.name.toLowerCase().includes("574") ||
                      product.name.toLowerCase().includes("fuelcell") ||
                      product.name.toLowerCase().includes("adilette")
                      ? SHOE_SIZES : SIZES
                    ).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => { setSelectedSize(size); setSizePickerOpen(false); }}
                        className={`px-3 py-1.5 text16 border transition ${
                          selectedSize === size
                            ? "border-black bg-black text-white"
                            : "border-black/30 bg-white hover:bg-gray-100"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {!sizePickerOpen && <div className="mb-3" />}
              <button
                type="button"
                onClick={() => addToCart(product.id)}
                disabled={adding}
                className={`w-full py-3 text24 border border-black ${adding ? "bg-gray-300" : "bg-black text-white hover:bg-gray-900"}`}
              >
                {adding ? "Добавляем..." : "В корзину"}
              </button>
              <button
                type="button"
                onClick={() => void shareProduct()}
                className="w-full mt-3 py-2 text16 border border-black bg-white hover:bg-gray-100 inline-flex items-center justify-center gap-2"
              >
                <Image src="/share-icon.png" alt="Поделиться" width={16} height={16} />
                <span>Поделиться</span>
              </button>
              <p className="text20 mt-6">Доставка в г.Москва</p>
            </aside>
          </div>

          <section className="mb-10">
            <div role="tablist" aria-label="Информация о товаре" className="flex gap-0 border-b border-black/15 mb-6">
              {([
                { key: "about" as TabKey, label: "О товаре" },
                { key: "brand" as TabKey, label: "О бренде" },
                { key: "reviews" as TabKey, label: "Отзывы" },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  aria-controls={`tabpanel-${tab.key}`}
                  id={`tab-${tab.key}`}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 text20 font-semibold transition-colors relative ${
                    activeTab === tab.key
                      ? "text-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                  )}
                </button>
              ))}
            </div>

            {activeTab === "about" && (
              <div role="tabpanel" id="tabpanel-about" aria-labelledby="tab-about" className="max-w-4xl space-y-4">
                <p className="text20">{product.description || "Описание товара будет добавлено продавцом."}</p>
                {product.collection && (
                  <p className="text16 text-gray-600">
                    Коллекция:{" "}
                    <Link href={`/collections/${product.collection.slug}`} className="underline">
                      {product.collection.name}
                    </Link>
                  </p>
                )}
              </div>
            )}

            {activeTab === "brand" && (
              <div role="tabpanel" id="tabpanel-brand" aria-labelledby="tab-brand" className="max-w-4xl space-y-4">
                {product.brand ? (
                  <>
                    <h3 className="text20 font-semibold">{product.brand.name}</h3>
                    <p className="text16 text-gray-600">
                      {product.brand.is_celebrity
                        ? `${product.brand.name} — знаменитость с эксклюзивными коллекциями и мерчем на VogueWay.`
                        : `${product.brand.name} — один из ведущих брендов, представленных на VogueWay.`}
                    </p>
                    <Link
                      href={product.brand.is_celebrity ? `/celebrities/${product.brand.slug}` : `/brands/${product.brand.slug}`}
                      className="inline-block text16 underline"
                    >
                      Все товары {product.brand.name} →
                    </Link>
                  </>
                ) : (
                  <p className="text16 text-gray-400">Информация о бренде недоступна.</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div role="tabpanel" id="tabpanel-reviews" aria-labelledby="tab-reviews" className="max-w-4xl space-y-6">
                {/* Review form */}
                <div className="border border-black/15 bg-white p-5">
                  <h3 className="text20 font-semibold mb-3">Оставить отзыв</h3>
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        aria-label={`Оценка ${star} из 5`}
                        className={`text-2xl ${star <= reviewRating ? "text-yellow-500" : "text-gray-300"}`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text16 text-gray-500 ml-2">{reviewRating}/5</span>
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Напишите ваш отзыв (необязательно)"
                    rows={3}
                    className="w-full border border-black/20 p-3 text16 bg-[#fafafa] resize-y mb-3"
                  />
                  <button
                    type="button"
                    onClick={submitReview}
                    disabled={reviewSubmitting}
                    className={`px-6 py-2 text16 border border-black ${reviewSubmitting ? "bg-gray-300" : "bg-black text-white hover:bg-gray-900"}`}
                  >
                    {reviewSubmitting ? "Отправка..." : "Отправить отзыв"}
                  </button>
                </div>

                {/* Reviews list */}
                {reviews.length === 0 ? (
                  <div className="border border-dashed border-black/15 bg-white/60 rounded-xl px-6 py-10 text-center">
                    <p className="text20 text-gray-400 mb-2">Отзывов пока нет</p>
                    <p className="text16 text-gray-400">Будьте первым, кто оставит отзыв на этот товар.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border border-black/15 bg-white p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text16 font-semibold">{review.user_name || "Пользователь"}</span>
                            <span className="text-yellow-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                          </div>
                          <span className="text14 text-gray-400">
                            {review.created_at ? new Date(review.created_at).toLocaleDateString("ru-RU") : ""}
                          </span>
                        </div>
                        {review.text && <p className="text16 text-gray-700">{review.text}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
