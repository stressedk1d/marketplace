"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getRecentlyViewed,
  type RecentProductSnapshot,
} from "@/lib/recently-viewed";

const PLACEHOLDER = "/images/catalog-demo/nike-01.svg";

export function RecentViewedSection() {
  const [items, setItems] = useState<RecentProductSnapshot[]>([]);

  useEffect(() => {
    const sync = () => setItems(getRecentlyViewed());
    sync();
    window.addEventListener("vw-recently-viewed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vw-recently-viewed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="animate-home-soft space-y-8">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
          Recently viewed
        </h2>
        <p className="mt-2 max-w-lg text-neutral-600">
          Сохранено в этом браузере — до 10 последних уникальных товаров.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => {
          const src = p.image_url?.trim() || PLACEHOLDER;
          return (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md"
            >
              <div className="relative h-52 w-full bg-neutral-200">
                <Image
                  src={src}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-neutral-900">
                  {p.name}
                </h3>
                <p className="mt-2 text-base font-semibold text-black">
                  {Math.round(p.price)} ₽
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
