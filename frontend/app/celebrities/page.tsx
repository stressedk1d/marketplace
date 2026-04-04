"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import type { CatalogBrand } from "@/lib/catalog-types";

export default function CelebritiesListPage() {
  const [brands, setBrands] = useState<CatalogBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl("/brands?is_celebrity=true"))
      .then((r) => r.json())
      .then((data: CatalogBrand[]) => {
        if (!cancelled) setBrands(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setBrands([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen py-8">
      <div className="container-main text-black">
        <h1 className="h32 mb-8">Знаменитости</h1>
        {loading ? (
          <p className="text16 text-gray-500">Загрузка…</p>
        ) : brands.length === 0 ? (
          <p className="text16 text-gray-500">Список пуст.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/celebrities/${brand.slug}`}
                className="group flex flex-col items-center gap-3"
              >
                <div className="relative aspect-square w-full overflow-hidden border border-black/10 bg-[#d9d9d9]">
                  {brand.logo_url ? (
                    <Image
                      src={brand.logo_url}
                      alt={brand.name}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-400">
                      {brand.name.slice(0, 1)}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p className="text16 font-semibold">{brand.name}</p>
                  <p className="text16 text-gray-500 text-sm">
                    Мерч на маркетплейсе
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
