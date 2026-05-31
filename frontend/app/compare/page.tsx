"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiUrl } from "@/lib/api";
import { getCompareIds, removeFromCompare, clearCompare } from "@/lib/compare";
import { formatPrice } from "@/lib/format";
import { publicImageSrc } from "@/lib/image-src";
import StarRating from "@/app/components/StarRating";
import type { Product } from "@/app/catalog/types";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import EmptyState from "@/app/components/EmptyState";
import { PageHero } from "@/app/components/PageHero";
import {
  pageContent,
  pageShell,
  pageSummaryCard,
} from "@/lib/page-classes";
import { pageOutlineButton } from "@/lib/ui";

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const ids = getCompareIds();
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(apiUrl(`/products/${id}`));
          return res.ok ? ((await res.json()) as Product) : null;
        })
      );
      setProducts(results.filter(Boolean) as Product[]);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const onChange = () => void load();
    window.addEventListener("vw-compare-change", onChange);
    return () => window.removeEventListener("vw-compare-change", onChange);
  }, []);

  const attrs: { key: string; label: string; render: (p: Product) => string }[] = [
    { key: "price", label: "Цена", render: (p) => formatPrice(p.price) },
    { key: "brand", label: "Бренд", render: (p) => p.brand?.name ?? "—" },
    { key: "type", label: "Тип", render: (p) => p.product_type },
    {
      key: "rating",
      label: "Рейтинг",
      render: (p) =>
        p.review_count && p.avg_rating != null
          ? `${p.avg_rating.toFixed(1)} (${p.review_count})`
          : "—",
    },
    {
      key: "sizes",
      label: "Размеры",
      render: (p) =>
        p.variants && p.variants.length > 0
          ? p.variants.filter((v) => v.stock > 0).map((v) => v.size).join(", ") || "Нет в наличии"
          : "—",
    },
  ];

  return (
    <div className={pageShell}>
      <div className={`${pageContent} pt-8 sm:pt-10`}>
        <Breadcrumbs items={[{ label: "Сравнение" }]} />

        <div className="flex flex-wrap items-end justify-between gap-4">
          <PageHero
            eyebrow="Compare"
            title="Сравнение товаров"
            description="Добавьте до 3 товаров из каталога и сравните характеристики side-by-side."
            variant="light"
          />
          {products.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearCompare();
                setProducts([]);
              }}
              className={`${pageOutlineButton} !w-auto shrink-0 !min-h-[44px] px-6 !text-sm`}
            >
              Очистить всё
            </button>
          )}
        </div>

        {loading && (
          <p className="text-sm text-neutral-500">Загрузка...</p>
        )}

        {!loading && products.length === 0 && (
          <EmptyState
            icon="⚖"
            title="Список сравнения пуст"
            description="Отметьте товары в каталоге — добавьте до 3 позиций для сравнения."
            actionLabel="В каталог"
            actionHref="/catalog"
          />
        )}

        {!loading && products.length > 0 && (
          <div className={`${pageSummaryCard} overflow-x-auto !p-0`}>
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200/80 dark:border-neutral-700">
                  <th className="w-36 p-4 font-medium text-neutral-500">Параметр</th>
                  {products.map((p) => (
                    <th key={p.id} className="p-4 align-top">
                      <div className="relative mx-auto h-32 w-24 overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-800">
                        <Image
                          src={publicImageSrc(p.image_url)}
                          alt={p.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <Link
                        href={`/product/${p.id}`}
                        className="mt-2 block font-semibold transition hover:underline"
                      >
                        {p.name}
                      </Link>
                      {p.review_count && p.avg_rating != null && (
                        <div className="mt-1">
                          <StarRating rating={p.avg_rating} count={p.review_count} size="sm" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFromCompare(p.id)}
                        className="mt-2 text-xs text-red-600 hover:underline dark:text-red-400"
                      >
                        Убрать
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attrs.map((row) => (
                  <tr key={row.key} className="border-b border-neutral-100 dark:border-neutral-800">
                    <td className="p-4 font-medium text-neutral-500">{row.label}</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-4">
                        {row.render(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
