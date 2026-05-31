"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getRecentlyViewed,
  type RecentProductSnapshot,
} from "@/lib/recently-viewed";
import { apiUrl } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { publicImageSrc } from "@/lib/image-src";
import { homeProductCard, homeProductImage } from "@/lib/home-classes";
import { HomeSectionHeader } from "./HomeSectionHeader";

const PLACEHOLDER = "/images/catalog-demo/nike-01.svg";

type ProductRow = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  brand?: { slug: string; name: string } | null;
};

export function RecommendedForYouSection() {
  const [items, setItems] = useState<ProductRow[]>([]);
  const [brandLabel, setBrandLabel] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;

    const load = async () => {
      const recent = getRecentlyViewed();
      if (recent.length === 0) {
        if (!disposed) {
          setItems([]);
          setBrandLabel(null);
        }
        return;
      }

      const viewedIds = new Set(recent.map((r) => r.id));
      const brandSlug =
        recent.find((r) => r.brand_slug)?.brand_slug ??
        (await resolveBrandSlug(recent[0]));

      if (!brandSlug) {
        if (!disposed) setItems([]);
        return;
      }

      try {
        const res = await fetch(
          apiUrl(
            `/products?brand_slug=${encodeURIComponent(brandSlug)}&limit=12&offset=0&sort=popular`
          ),
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { items?: ProductRow[] };
        const rows = (data.items ?? [])
          .filter((p) => !viewedIds.has(p.id))
          .slice(0, 4);
        if (!disposed) {
          setItems(rows);
          setBrandLabel(rows[0]?.brand?.name ?? brandSlug);
        }
      } catch {
        if (!disposed) setItems([]);
      }
    };

    const onRecentlyViewed = () => void load();
    void load();
    window.addEventListener("vw-recently-viewed", onRecentlyViewed);
    return () => {
      disposed = true;
      window.removeEventListener("vw-recently-viewed", onRecentlyViewed);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="space-y-8">
      <HomeSectionHeader
        title="Рекомендуем для вас"
        description={
          brandLabel
            ? `Подборка на основе ваших просмотров — бренд ${brandLabel}.`
            : "Подборка на основе ваших недавних просмотров."
        }
        href="/catalog"
        linkLabel="Весь каталог"
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((p) => {
          const src = publicImageSrc(p.image_url?.trim() || PLACEHOLDER);
          return (
            <Link key={p.id} href={`/product/${p.id}`} className={homeProductCard}>
              <div className={homeProductImage}>
                <Image
                  src={src}
                  alt={p.name}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
                  {p.name}
                </h3>
                <p className="mt-2 text-base font-semibold text-black dark:text-white">
                  {formatPrice(p.price)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

async function resolveBrandSlug(entry: RecentProductSnapshot): Promise<string | null> {
  try {
    const res = await fetch(apiUrl(`/products/${entry.id}`), { cache: "no-store" });
    if (!res.ok) return null;
    const payload = (await res.json()) as { brand?: { slug: string } | null };
    return payload.brand?.slug ?? null;
  } catch {
    return null;
  }
}
