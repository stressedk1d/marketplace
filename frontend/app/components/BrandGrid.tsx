import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/app/components/home/ScrollReveal";
import {
  pageBrandCard,
  pageContent,
  pageEmptyState,
  pageGridBrands,
  pageLogoBox,
  pageShell,
} from "@/lib/page-classes";

type BrandItem = {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
};

type BrandGridProps = {
  brands: BrandItem[];
  hrefPrefix: string;
  emptyMessage?: string;
};

export function BrandGrid({
  brands,
  hrefPrefix,
  emptyMessage = "Список пуст.",
}: BrandGridProps) {
  if (brands.length === 0) {
    return <p className={pageEmptyState}>{emptyMessage}</p>;
  }

  return (
    <ScrollReveal>
      <div className={pageGridBrands}>
        {brands.map((b) => (
          <Link key={b.id} href={`${hrefPrefix}/${b.slug}`} className={pageBrandCard}>
            <div className={pageLogoBox}>
              {b.logo_url ? (
                <Image
                  src={b.logo_url}
                  alt={`Логотип ${b.name}`}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-contain p-2 transition duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="text-3xl font-bold text-neutral-400 transition group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
                  {b.name.slice(0, 1)}
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{b.name}</h2>
            <p className="mt-1 text-sm text-neutral-500 transition group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-300">
              Коллекции →
            </p>
          </Link>
        ))}
      </div>
    </ScrollReveal>
  );
}
