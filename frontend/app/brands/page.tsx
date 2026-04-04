"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiUrl } from "@/lib/api";

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl("/brands"))
      .then((r) => r.json())
      .then((d: Brand[]) => setBrands(Array.isArray(d) ? d : []))
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-10 text20">Загрузка брендов…</div>
    );
  }

  return (
    <div className="min-h-screen py-10 text-black">
      <div className="container-main">
        <h1 className="h32 mb-2">Бренды</h1>
        <p className="text16 text-gray-600 mb-10 max-w-2xl">
          Выберите бренд, чтобы открыть его коллекции и товары.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/brands/${b.slug}`}
              className="border border-black/15 bg-white p-8 flex flex-col items-center text-center hover:border-black transition"
            >
              <div className="relative w-28 h-28 mb-5 bg-[#f3f3f3] rounded-full overflow-hidden border border-black/10">
                {b.logo_url ? (
                  <Image
                    src={b.logo_url}
                    alt={b.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-3xl font-semibold text-gray-400">
                    {b.name.slice(0, 1)}
                  </span>
                )}
              </div>
              <h2 className="text20 font-semibold">{b.name}</h2>
              <p className="text16 text-gray-500 mt-2">Перейти к коллекциям</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
