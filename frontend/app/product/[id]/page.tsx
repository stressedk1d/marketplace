"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { apiUrl, apiFetch } from "@/lib/api";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import EmptyState from "@/app/components/EmptyState";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { ProductPageSkeleton } from "@/app/components/ProductGridSkeleton";
import WishlistHeart from "@/app/components/WishlistHeart";
import StarRating from "@/app/components/StarRating";
import SizeGuideModal from "@/app/components/SizeGuideModal";
import { useCart } from "@/lib/CartContext";
import { useToast } from "@/lib/ToastContext";
import { useWishlist } from "@/lib/useWishlist";
import { recordProductView } from "@/lib/recently-viewed";
import { formatPrice } from "@/lib/format";
import { publicImageSrc } from "@/lib/image-src";
import {
  pageBuyBox,
  pageContent,
  pageCtaPrimary,
  pageGalleryMain,
  pageProductCard,
  pageProductImage,
  pageShell,
  pageTabActive,
  pageTabIdle,
} from "@/lib/page-classes";
import { pageOutlineButton } from "@/lib/ui";

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

interface ProductVariant {
  size: string;
  stock: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  images: string[];
  product_type: string;
  brand?: BrandBrief | null;
  collection?: CollectionBrief | null;
  avg_rating?: number | null;
  review_count: number;
  variants: ProductVariant[];
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

type TabKey = "about" | "brand" | "reviews";

function productGallery(product: Product): string[] {
  const fromApi = (product.images ?? []).filter(Boolean);
  if (fromApi.length > 0) return fromApi;
  if (product.image_url) return [product.image_url];
  return [];
}

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("about");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizePickerOpen, setSizePickerOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryFade, setGalleryFade] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const { refreshCart, bumpCart } = useCart();
  const { showToast } = useToast();
  const { ids: wishlistIds, toggle: toggleWishlist } = useWishlist();

  const isShoes = product?.product_type === "shoes";
  const hasVariants = (product?.variants?.length ?? 0) > 0;

  const galleryImages = useMemo(
    () => (product ? productGallery(product) : []),
    [product]
  );

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeLightbox]);

  const reloadProduct = useCallback(async (id: string) => {
    const res = await fetch(apiUrl(`/products/${id}`));
    if (res.ok) setProduct(await res.json());
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [productRes, similarRes] = await Promise.all([
          fetch(apiUrl(`/products/${params.id}`)),
          fetch(apiUrl(`/products/${params.id}/similar?limit=6`)),
        ]);
        if (productRes.ok) setProduct(await productRes.json());
        if (similarRes.ok) setSimilar(await similarRes.json());
      } catch (err) {
        console.error("Product page fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [params.id]);

  useEffect(() => {
    setGalleryIndex(0);
    setSelectedSize(null);
  }, [product?.id]);

  const selectGalleryImage = (index: number) => {
    if (index === galleryIndex) return;
    setGalleryFade(false);
    window.setTimeout(() => {
      setGalleryIndex(index);
      setGalleryFade(true);
    }, 120);
  };

  useEffect(() => {
    if (!product) return;
    recordProductView({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url ?? null,
      brand_slug: product.brand?.slug ?? null,
    });
  }, [product]);

  useEffect(() => {
    if (!product) return;
    fetch(apiUrl(`/products/${product.id}/reviews`))
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]));
  }, [product]);

  const submitReview = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Войдите, чтобы оставить отзыв", "error");
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await apiFetch(apiUrl(`/products/${product!.id}/reviews`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: reviewRating, text: reviewText || null }),
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setReviewText("");
        setReviewRating(5);
        showToast("Отзыв добавлен", "success");
        await reloadProduct(String(product!.id));
      } else {
        const data = await res.json();
        showToast(data.detail || "Не удалось добавить отзыв", "error");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") {
        showToast("Сессия истекла", "error");
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  const addToCart = async (id: number, size?: string | null) => {
    const sizeToUse = size ?? selectedSize;
    if (hasVariants && !sizeToUse) {
      showToast("Выберите размер перед добавлением в корзину", "error");
      setSizePickerOpen(true);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Войдите в аккаунт, чтобы добавить товар в корзину", "error");
      return;
    }
    setAdding(true);
    bumpCart(1);
    try {
      const res = await apiFetch(apiUrl("/cart/add"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: id,
          quantity: 1,
          size: sizeToUse || undefined,
        }),
      });
      if (res.ok) {
        showToast("Товар добавлен в корзину", "success");
        void refreshCart();
      } else {
        bumpCart(-1);
        const data = await res.json().catch(() => ({}));
        showToast(
          typeof data.detail === "string" ? data.detail : "Не удалось добавить товар",
          "error"
        );
      }
    } catch (err: unknown) {
      bumpCart(-1);
      if (err instanceof Error && err.message === "SESSION_EXPIRED") {
        showToast("Сессия истекла, войдите снова", "error");
      }
    } finally {
      setAdding(false);
    }
  };

  const shareProduct = async () => {
    if (!product) return;
    const shareData = {
      title: product.name,
      text: `${product.name} — ${formatPrice(product.price)}`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        showToast("Ссылка скопирована", "success");
      }
    } catch {
      /* user cancelled share */
    }
  };

  if (loading) return <ProductPageSkeleton />;

  if (!product) {
    return (
      <div className={pageShell}>
        <div className={`${pageContent} pt-8 sm:pt-10`}>
          <EmptyState
            icon="?"
            title="Товар не найден"
            description="Возможно, товар снят с продажи или ссылка устарела."
            actionLabel="В каталог"
            actionHref="/catalog"
          />
        </div>
      </div>
    );
  }

  const activeSrc = galleryImages[galleryIndex] ?? galleryImages[0];

  return (
    <>
      <div className={`${pageShell} py-4 pb-24 sm:py-8 sm:pb-8`}>
        <div className={pageContent}>
          <Breadcrumbs
            items={[{ label: "Каталог", href: "/catalog" }, { label: product.name }]}
          />

          <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <section className="lg:col-span-2">
              {activeSrc && (
                <>
                  <div
                    onClick={() => setLightbox(activeSrc)}
                    className={pageGalleryMain}
                  >
                    <Image
                      key={activeSrc}
                      src={publicImageSrc(activeSrc)}
                      alt={product.name}
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className={`gallery-main-image object-cover ${galleryFade ? "opacity-100" : "opacity-0"}`}
                    />
                  </div>
                  {galleryImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {galleryImages.map((src, i) => (
                        <button
                          key={`${src}-${i}`}
                          type="button"
                          onClick={() => selectGalleryImage(i)}
                          className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-20 sm:w-20 ${
                            i === galleryIndex
                              ? "border-black dark:border-white"
                              : "border-black/15 opacity-80 hover:opacity-100 dark:border-white/20"
                          }`}
                          aria-label={`Фото ${i + 1}`}
                          aria-current={i === galleryIndex}
                        >
                          <Image
                            src={publicImageSrc(src)}
                            alt=""
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>

            <aside className={pageBuyBox}>
              <div className="mb-2 flex items-start justify-between gap-3">
                <p className="text16 text-gray-500 dark:text-gray-400">Бренд/знаменитость</p>
                <WishlistHeart
                  saved={wishlistIds.has(product.id)}
                  onToggle={() =>
                    void toggleWishlist(product.id, () => {
                      showToast("Войдите, чтобы сохранять избранное", "error");
                    })
                  }
                />
              </div>
              <h1 className="mb-2 text-2xl font-bold tracking-tight sm:mb-3 sm:text-3xl">{product.name}</h1>
              {product.avg_rating != null && product.review_count > 0 && (
                <div className="mb-3">
                  <StarRating
                    rating={product.avg_rating}
                    count={product.review_count}
                    size="md"
                  />
                </div>
              )}
              {product.brand && (
                <p className="text16 mb-2 text-gray-600">
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
                <p className="text16 mb-4 text-gray-600">
                  Коллекция:{" "}
                  <Link
                    href={`/collections/${product.collection.slug}`}
                    className="underline"
                  >
                    {product.collection.name}
                  </Link>
                </p>
              )}
              <p className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:mb-6">
                {formatPrice(product.price)}
              </p>

              {hasVariants && (
                <>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text16 text-gray-600">Размер</span>
                    <button
                      type="button"
                      onClick={() => setSizeGuideOpen(true)}
                      className="text14 text-gray-600 underline hover:text-black"
                    >
                      Таблица размеров
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSizePickerOpen(!sizePickerOpen)}
                    className="mb-1 flex w-full items-center justify-between border border-black bg-white px-3 py-2 text16"
                  >
                    <span>
                      {selectedSize ? `Размер: ${selectedSize}` : "Выбрать размер"}
                    </span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      className={`transition-transform ${sizePickerOpen ? "rotate-180" : ""}`}
                    >
                      <path
                        d="M2 4l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  {sizePickerOpen && (
                    <div className="mb-3 border border-black/15 bg-white p-3">
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((v) => {
                          const out = v.stock <= 0;
                          return (
                            <button
                              key={v.size}
                              type="button"
                              disabled={out}
                              onClick={() => {
                                if (out) return;
                                setSelectedSize(v.size);
                                setSizePickerOpen(false);
                              }}
                              className={`px-3 py-1.5 text16 border transition ${
                                out
                                  ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 line-through"
                                  : selectedSize === v.size
                                    ? "border-black bg-black text-white"
                                    : "border-black/30 bg-white hover:bg-gray-100"
                              }`}
                              title={out ? "Нет в наличии" : `${v.stock} шт.`}
                            >
                              {v.size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={() => void addToCart(product.id)}
                disabled={adding}
                aria-busy={adding}
                className={`${pageCtaPrimary} ${adding ? "opacity-80" : ""}`}
              >
                {adding ? "Добавляем..." : "В корзину"}
              </button>
              <button
                type="button"
                onClick={() => void shareProduct()}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white py-2.5 text16 transition hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              >
                <Image src="/share-icon.png" alt="Поделиться" width={16} height={16} />
                <span>Поделиться</span>
              </button>
              <p className="text20 mt-6">Доставка в г. Москва</p>
            </aside>
          </div>

          <section className="mb-10">
            <div
              role="tablist"
              aria-label="Информация о товаре"
              className="mb-6 flex gap-1 border-b border-neutral-200 dark:border-neutral-700"
            >
              {(
                [
                  { key: "about" as TabKey, label: "О товаре" },
                  { key: "brand" as TabKey, label: "О бренде" },
                  {
                    key: "reviews" as TabKey,
                    label: `Отзывы${product.review_count ? ` (${product.review_count})` : ""}`,
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 text-base transition-colors sm:px-6 sm:text-lg ${
                    activeTab === tab.key ? pageTabActive : pageTabIdle
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "about" && (
              <div className="max-w-4xl space-y-4">
                <p className="text20">
                  {product.description || "Описание товара будет добавлено продавцом."}
                </p>
              </div>
            )}

            {activeTab === "brand" && (
              <div className="max-w-4xl space-y-4">
                {product.brand ? (
                  <>
                    <h3 className="text20 font-semibold">{product.brand.name}</h3>
                    <p className="text16 text-gray-600">
                      {product.brand.is_celebrity
                        ? `${product.brand.name} — знаменитость с эксклюзивными коллекциями на VogueWay.`
                        : `${product.brand.name} — бренд на VogueWay.`}
                    </p>
                    <Link
                      href={
                        product.brand.is_celebrity
                          ? `/celebrities/${product.brand.slug}`
                          : `/brands/${product.brand.slug}`
                      }
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
              <div className="max-w-4xl space-y-6">
                {product.avg_rating != null && product.review_count > 0 && (
                  <StarRating
                    rating={product.avg_rating}
                    count={product.review_count}
                    size="md"
                  />
                )}
                <div className="border border-black/15 bg-white p-5 dark:border-white/15 dark:bg-[var(--surface)]">
                  <h3 className="text20 mb-3 font-semibold">Оставить отзыв</h3>
                  <div className="mb-3 flex items-center gap-1">
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
                    <span className="text16 ml-2 text-gray-500">{reviewRating}/5</span>
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Напишите ваш отзыв (необязательно)"
                    rows={3}
                    className="text16 mb-3 w-full resize-y border border-black/20 bg-[#fafafa] p-3 dark:border-white/20 dark:bg-neutral-900 dark:text-[var(--foreground)]"
                  />
                  <button
                    type="button"
                    onClick={() => void submitReview()}
                    disabled={reviewSubmitting}
                    className={`text16 border border-black px-6 py-2 ${
                      reviewSubmitting ? "bg-gray-300" : "bg-black text-white hover:bg-gray-900"
                    }`}
                  >
                    {reviewSubmitting ? "Отправка..." : "Отправить отзыв"}
                  </button>
                </div>

                {reviews.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-black/15 bg-white/60 px-6 py-10 text-center dark:border-white/15 dark:bg-neutral-900/50">
                    <p className="text20 mb-2 text-gray-400">Отзывов пока нет</p>
                    <p className="text16 text-gray-400">Будьте первым!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border border-black/15 bg-white p-4 dark:border-white/15 dark:bg-[var(--surface)]">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text16 font-semibold">
                              {review.user_name || "Пользователь"}
                            </span>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                          <span className="text14 text-gray-400">
                            {review.created_at
                              ? new Date(review.created_at).toLocaleDateString("ru-RU")
                              : ""}
                          </span>
                        </div>
                        {review.text && (
                          <p className="text16 text-gray-700">{review.text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {similar.length > 0 && (
            <ScrollReveal>
              <section>
                <h2 className="mb-5 text-xl font-bold tracking-tight sm:text-2xl">Похожие товары</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  {similar.map((item) => (
                    <article key={item.id} className={`${pageProductCard} flex flex-col`}>
                      <div className={`${pageProductImage} h-44`}>
                        <Link href={`/product/${item.id}`} className="absolute inset-0 block">
                          <Image
                            src={publicImageSrc(item.image_url)}
                            alt={item.name}
                            fill
                            unoptimized
                            className="object-cover transition duration-300 group-hover:scale-105"
                          />
                        </Link>
                        <div className="absolute right-1.5 top-1.5 z-10">
                          <WishlistHeart
                            size="sm"
                            saved={wishlistIds.has(item.id)}
                            onToggle={() =>
                              void toggleWishlist(item.id, () => {
                                showToast("Войдите, чтобы сохранять избранное", "error");
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-3">
                        <p className="mb-1 line-clamp-2 min-h-[40px] text-sm font-semibold">{item.name}</p>
                        <p className="mb-2 flex-1 text-sm font-bold">{formatPrice(item.price)}</p>
                        <Link
                          href={`/product/${item.id}`}
                          className={`mt-auto text-center ${pageOutlineButton} !min-h-[36px] !text-xs`}
                        >
                          Подробнее
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </ScrollReveal>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center gap-3 border-t border-black/15 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm dark:border-white/15 dark:bg-[var(--surface)]/95 dark:shadow-[0_-4px_20px_rgba(0,0,0,0.35)] lg:hidden">
        <p className="shrink-0 text18 font-bold">{formatPrice(product.price)}</p>
        <button
          type="button"
          onClick={() => void addToCart(product.id)}
          disabled={adding}
          className={`min-h-11 flex-1 rounded-full py-2.5 text16 font-semibold transition active:scale-[0.98] ${
            adding ? "bg-neutral-400 dark:bg-neutral-600" : "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
          }`}
        >
          {adding ? "Добавляем..." : "В корзину"}
        </button>
      </div>

      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        isShoes={isShoes}
      />

      {lightbox && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/90"
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-6 top-4 text-4xl leading-none text-white hover:opacity-70"
            aria-label="Закрыть"
          >
            ×
          </button>
          <div className="relative mx-4 h-full max-h-[90vh] w-full max-w-4xl">
            <Image
              src={publicImageSrc(lightbox)}
              alt="Просмотр"
              fill
              unoptimized
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
