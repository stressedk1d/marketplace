"use client";

import Image from "next/image";
import Link from "next/link";

import EmptyState from "@/app/components/EmptyState";
import WishlistHeart from "@/app/components/WishlistHeart";
import { Product } from "@/app/catalog/types";
import { ui } from "@/app/catalog/ui/classes";
import { formatPrice } from "@/lib/format";
import { publicImageSrc } from "@/lib/image-src";
import { pageProductCard, pageProductImage } from "@/lib/page-classes";
import { pageOutlineButton } from "@/lib/ui";
import StarRating from "@/app/components/StarRating";

interface ProductGridProps {
  products: Product[];
  wishlistIds: Set<number>;
  compareIds?: Set<number>;
  onToggleWishlist: (productId: number) => void;
  onAddToCart: (productId: number) => void;
  onToggleCompare?: (productId: number) => void;
  onQuickView?: (productId: number) => void;
}

export default function ProductGrid({
  products,
  wishlistIds,
  compareIds,
  onToggleWishlist,
  onAddToCart,
  onToggleCompare,
  onQuickView,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="Ничего не найдено"
        description="Попробуйте изменить фильтры или поисковый запрос."
        actionLabel="Сбросить фильтры"
        actionHref="/catalog"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <article
          key={product.id}
          className={`${pageProductCard} catalog-grid-item flex flex-col`}
          style={{ animationDelay: `${Math.min(index, 11) * 40}ms` }}
        >
          <div className={`${pageProductImage} aspect-[4/5] w-full overflow-hidden`}>
            <Link href={`/product/${product.id}`} prefetch className="absolute inset-0 block">
              <Image
                src={publicImageSrc(product.image_url)}
                alt={product.name}
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            </Link>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent" />
            <div className={`absolute right-2 top-2 z-10 ${ui.icon.floating}`}>
              <WishlistHeart
                saved={wishlistIds.has(product.id)}
                onToggle={() => onToggleWishlist(product.id)}
              />
            </div>
            {onToggleCompare && (
              <label className="absolute left-2 top-2 z-10 flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200/90 bg-white/95 px-2.5 py-1 text-xs shadow-sm backdrop-blur-sm dark:border-neutral-600 dark:bg-neutral-900/90 dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={compareIds?.has(product.id) ?? false}
                  onChange={() => onToggleCompare(product.id)}
                  className="h-3.5 w-3.5 rounded accent-neutral-900 dark:accent-white"
                  aria-label="Сравнить"
                />
                <span className="hidden sm:inline">Сравнить</span>
              </label>
            )}
            <div className="pointer-events-none absolute inset-x-2 bottom-2 flex translate-y-1 flex-col gap-1.5 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
              {onQuickView && (
                <button
                  type="button"
                  onClick={() => onQuickView(product.id)}
                  className={`pointer-events-auto ${pageOutlineButton} !min-h-[36px] !text-xs backdrop-blur-sm`}
                >
                  Быстрый просмотр
                </button>
              )}
              <button
                type="button"
                onClick={() => onAddToCart(product.id)}
                className={`pointer-events-auto ${ui.button.primary}`}
              >
                В корзину
              </button>
            </div>
          </div>
          <div className="flex flex-1 flex-col p-3 sm:p-4">
            {product.brand && (
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {product.brand.name}
              </p>
            )}
            {product.collection && (
              <Link
                href={`/collections/${product.collection.slug}`}
                className="mb-2 inline-block w-fit rounded-full border border-neutral-200/90 px-2.5 py-0.5 text-xs text-neutral-600 transition hover:border-neutral-400 dark:border-neutral-600 dark:text-neutral-400"
              >
                {product.collection.name}
              </Link>
            )}
            <Link href={`/product/${product.id}`} className="mb-1 block">
              <h2 className="line-clamp-2 min-h-[40px] text-sm font-semibold leading-snug tracking-tight text-neutral-900 dark:text-neutral-100">
                {product.name}
              </h2>
            </Link>
            {product.review_count && product.review_count > 0 && product.avg_rating != null && (
              <div className="mb-2">
                <StarRating rating={product.avg_rating} count={product.review_count} size="sm" />
              </div>
            )}
            <p className="mt-auto text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              {formatPrice(product.price)}
            </p>
            <button
              type="button"
              onClick={() => onAddToCart(product.id)}
              className={`mt-2 sm:hidden ${pageOutlineButton} !min-h-[36px] !text-xs`}
            >
              В корзину
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
