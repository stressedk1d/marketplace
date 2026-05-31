"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiUrl } from "@/lib/api";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import EmptyState from "@/app/components/EmptyState";
import { PageHero } from "@/app/components/PageHero";
import { SimplePageSkeleton } from "@/app/components/ProductGridSkeleton";
import {
  pageCollectionCard,
  pageContent,
  pageShell,
} from "@/lib/page-classes";

interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_featured: boolean;
}

interface BrandRow {
  id: number;
  name: string;
  slug: string;
}

export default function BrandCollectionsPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const [collections, setCollections] = useState<Collection[]>([]);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetch(apiUrl("/brands"))
      .then((r) => r.json())
      .then((d: BrandRow[]) => {
        const b = Array.isArray(d) ? d.find((x) => x.slug === slug) : undefined;
        if (b) setBrandName(b.name);
      })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError("");
    fetch(apiUrl(`/brands/${slug}/collections`))
      .then((r) => {
        if (r.status === 404) {
          setError("Бренд не найден");
          return [];
        }
        return r.json();
      })
      .then((d: Collection[]) => setCollections(Array.isArray(d) ? d : []))
      .catch(() => setError("Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <SimplePageSkeleton label="Загрузка коллекций" />;

  if (error) {
    return (
      <div className={pageShell}>
        <div className={`${pageContent} pt-8 sm:pt-10`}>
          <EmptyState
            icon="?"
            title={error}
            description="Проверьте ссылку или вернитесь к списку брендов."
            actionLabel="Все бренды"
            actionHref="/brands"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={pageShell}>
      <div className={`${pageContent} pt-8 sm:pt-10`}>
        <Breadcrumbs
          items={[
            { label: "Бренды", href: "/brands" },
            { label: brandName || slug },
          ]}
        />

        <PageHero
          eyebrow="Brand"
          title={brandName || slug}
          description={
            collections.length > 0
              ? `${collections.length} ${collections.length === 1 ? "коллекция" : collections.length < 5 ? "коллекции" : "коллекций"} — выберите линейку и смотрите товары.`
              : "Коллекции этого бренда скоро появятся в каталоге."
          }
          variant="light"
        />

        {collections.length === 0 ? (
          <EmptyState
            icon="◇"
            title="Коллекций пока нет"
            description="Загляните в каталог — там уже есть товары этого бренда."
            actionLabel="В каталог"
            actionHref={`/catalog?brand_slug=${slug}`}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {collections.map((c) => (
              <Link
                key={c.id}
                href={`/collections/${c.slug}`}
                className={`${pageCollectionCard} block min-h-[140px]`}
              >
                <h2 className="mb-2 text-lg font-semibold">{c.name}</h2>
                {c.description && (
                  <p className="line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">
                    {c.description}
                  </p>
                )}
                {c.is_featured && (
                  <span className="mt-3 inline-block rounded-full border border-neutral-300 px-2.5 py-0.5 text-xs font-medium dark:border-neutral-600">
                    Избранное
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
