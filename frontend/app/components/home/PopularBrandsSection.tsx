import Image from "next/image";
import Link from "next/link";
import { fetchBrands } from "@/lib/catalog-fetch";
import {
  homeBrandCard,
  homeEmptyState,
} from "@/lib/home-classes";
import { HomeSectionHeader } from "./HomeSectionHeader";

export async function PopularBrandsSection() {
  const brands = await fetchBrands();

  return (
    <section className="space-y-8">
      <HomeSectionHeader
        eyebrow="Бренды"
        title="Популярные бренды"
        description="Nike, Adidas и другие — переходите к коллекциям одним кликом."
        href="/brands"
        linkLabel="Все бренды"
      />

      {brands.length === 0 ? (
        <p className={homeEmptyState}>
          Не удалось загрузить бренды. Проверьте, что API запущен.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {brands.map((b) => (
            <Link key={b.id} href={`/brands/${b.slug}`} className={homeBrandCard}>
              <div className="relative mb-4 flex h-24 w-32 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 ring-1 ring-neutral-200 transition group-hover:ring-neutral-300 dark:from-neutral-800 dark:to-neutral-700 dark:ring-neutral-600 dark:group-hover:ring-neutral-500">
                {b.logo_url ? (
                  <Image
                    src={b.logo_url}
                    alt={`Логотип ${b.name}`}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    className="object-contain p-2"
                  />
                ) : (
                  <span className="text-3xl font-bold text-neutral-400 transition group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
                    {b.name.slice(0, 1)}
                  </span>
                )}
              </div>
              <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {b.name}
              </span>
              <span className="mt-1 text-sm text-neutral-500 transition group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-300">
                Коллекции →
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
