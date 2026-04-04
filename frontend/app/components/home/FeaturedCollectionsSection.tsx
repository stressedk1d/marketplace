import Link from "next/link";
import { fetchFeaturedCollectionsRetail } from "@/lib/catalog-fetch";

export async function FeaturedCollectionsSection() {
  const collections = await fetchFeaturedCollectionsRetail();

  return (
    <section className="animate-home-soft space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
            Featured collections
          </h2>
          <p className="mt-2 max-w-lg text-neutral-600">
            Подборка актуальных линеек без мерча знаменитостей.
          </p>
        </div>
        <Link
          href="/catalog"
          className="text-sm font-semibold text-neutral-900 underline-offset-4 transition hover:underline"
        >
          Полный каталог
        </Link>
      </div>

      {collections.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white/60 px-6 py-10 text-center text-neutral-500">
          Коллекции пока недоступны.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-gradient-to-br from-white to-neutral-100 p-8 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 transition group-hover:text-neutral-700">
                {c.brand?.name ?? "Collection"}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-neutral-900">
                {c.name}
              </h3>
              {c.description && (
                <p className="mt-3 line-clamp-2 text-neutral-600">
                  {c.description}
                </p>
              )}
              <span className="mt-6 inline-flex items-center text-sm font-semibold text-neutral-900 underline-offset-4 group-hover:underline">
                Смотреть товары
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
