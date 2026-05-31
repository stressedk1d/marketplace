"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { publicImageSrc } from "@/lib/image-src";
import { pageCtaPrimary, pageProductCard, pageProductImage } from "@/lib/page-classes";
import { pageOutlineButton } from "@/lib/ui";

type SuggestedProduct = {
  id: number;
  name: string;
  price: number;
  image_url: string;
};

type SuggestedProductsProps = {
  title: string;
  products: SuggestedProduct[];
  onAddToCart: (id: number) => void;
};

export function SuggestedProducts({ title, products, onAddToCart }: SuggestedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {products.map((p) => (
          <article key={p.id} className={pageProductCard}>
            <Link href={`/product/${p.id}`} className="block">
              <div className={`${pageProductImage} h-40`}>
                <Image
                  src={publicImageSrc(p.image_url)}
                  alt={p.name}
                  fill
                  unoptimized
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
            </Link>
            <div className="flex flex-1 flex-col p-3">
              <p className="mb-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {formatPrice(p.price)}
              </p>
              <p className="mb-2 line-clamp-2 min-h-[40px] text-sm text-neutral-700 dark:text-neutral-300">
                {p.name}
              </p>
              <button
                type="button"
                onClick={() => onAddToCart(p.id)}
                className={`mt-auto w-full py-1.5 text-sm ${pageOutlineButton}`}
              >
                В корзину
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
