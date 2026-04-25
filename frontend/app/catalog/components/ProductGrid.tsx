"use client";

import Image from "next/image";
import Link from "next/link";

import WishlistHeart from "@/app/components/WishlistHeart";
import { Product } from "@/app/catalog/types";
import { ui } from "@/app/catalog/ui/classes";
import { tokens } from "@/app/catalog/ui/tokens";

interface ProductGridProps {
  products: Product[];
  wishlistIds: Set<number>;
  onToggleWishlist: (productId: number) => void;
  onAddToCart: (productId: number) => void;
}

export default function ProductGrid({
  products,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
}: ProductGridProps) {
  // UI governed by design system (tokens.ts + classes.ts)
  const cardClass =
    `group overflow-hidden text-black ${ui.card.interactive}`;
  const primaryButtonClass =
    `w-full px-3 py-2 ${ui.button.primary}`;
  const secondaryButtonClass =
    `mt-3 w-full px-3 py-2 ${ui.button.secondary}`;

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text20 text-gray-600">Ничего не найдено</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <article
          key={product.id}
          className={cardClass}
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
            <Link href={`/product/${product.id}`} className="block absolute inset-0">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                unoptimized
                className={`object-cover transition-transform ${tokens.transition.base} ${tokens.transition.easing} group-hover:scale-[1.02]`}
              />
            </Link>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent" />
            <div className={`absolute right-2 top-2 z-10 ${ui.icon.floating}`}>
              <WishlistHeart
                saved={wishlistIds.has(product.id)}
                onToggle={() => onToggleWishlist(product.id)}
              />
            </div>
            <div className={`pointer-events-none absolute inset-x-2 bottom-2 translate-y-1 opacity-0 ${ui.transition.base} group-hover:translate-y-0 group-hover:opacity-100`}>
              <button
                type="button"
                onClick={() => onAddToCart(product.id)}
                className={`pointer-events-auto ${primaryButtonClass}`}
              >
                В корзину
              </button>
            </div>
          </div>
          <div className="flex flex-1 flex-col p-4">
            {product.brand && <p className={`mb-1 text12 uppercase tracking-wide ${tokens.color.textMuted}`}>{product.brand.name}</p>}
            {product.collection && (
              <Link
                href={`/collections/${product.collection.slug}`}
                className={`mb-2 inline-block w-fit ${tokens.radius.sm} border ${tokens.color.borderDefault} px-2 py-1 text12 text-gray-600 ${ui.transition.base} ${tokens.color.hoverSubtle}`}
              >
                {product.collection.name}
              </Link>
            )}
            <Link href={`/product/${product.id}`} className="mb-1 block">
              <h2 className="min-h-[42px] line-clamp-2 text15 font-semibold leading-5 tracking-tight">
                {product.name}
              </h2>
            </Link>
            <p className={`mb-3 flex-1 line-clamp-2 text13 ${ui.text.muted}`}>{product.description}</p>
            <p className="mt-auto text18 font-bold tracking-tight">{product.price} ₽</p>
            <button
              type="button"
              onClick={() => onAddToCart(product.id)}
              className={`${secondaryButtonClass} group-hover:opacity-0 sm:hidden`}
            >
              В корзину
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
