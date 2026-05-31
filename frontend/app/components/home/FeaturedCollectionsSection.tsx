import Link from "next/link";
import { fetchFeaturedCollectionsRetail } from "@/lib/catalog-fetch";
import {
  homeCollectionCard,
  homeEmptyState,
} from "@/lib/home-classes";
import { HomeSectionHeader } from "./HomeSectionHeader";

export async function FeaturedCollectionsSection() {
  const collections = await fetchFeaturedCollectionsRetail();

  return (
    <section className="space-y-8">
      <HomeSectionHeader
        eyebrow="Коллекции"
        title="Избранные коллекции"
        description="Подборка актуальных линеек без мерча знаменитостей."
        href="/catalog"
        linkLabel="Полный каталог"
      />

      {collections.length === 0 ? (
        <p className={homeEmptyState}>Коллекции пока недоступны.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {collections.map((c) => (
            <Link key={c.id} href={`/collections/${c.slug}`} className={homeCollectionCard}>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 transition group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-200">
                {c.brand?.name ?? "Коллекция"}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
                {c.name}
              </h3>
              {c.description && (
                <p className="mt-3 line-clamp-2 text-neutral-600 dark:text-neutral-400">
                  {c.description}
                </p>
              )}
              <span className="mt-6 inline-flex items-center text-sm font-semibold text-neutral-900 underline-offset-4 group-hover:underline dark:text-neutral-200">
                Смотреть товары
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
