import Image from "next/image";
import Link from "next/link";
import { fetchCelebrityBrands } from "@/lib/catalog-fetch";
import {
  homeEmptyState,
  homeProductCard,
  homeProductImage,
} from "@/lib/home-classes";
import { HomeSectionHeader } from "./HomeSectionHeader";

export async function CelebritiesSection() {
  const celebrities = await fetchCelebrityBrands();

  return (
    <section className="space-y-8">
      <HomeSectionHeader
        eyebrow="Коллаборации"
        title="Знаменитости"
        description="Мерч и коллаборации — отдельный раздел знаменитостей."
        href="/celebrities"
        linkLabel="Все знаменитости"
      />

      {celebrities.length === 0 ? (
        <p className={homeEmptyState}>Знаменитости пока недоступны.</p>
      ) : (
        <div
          className={`grid gap-4 ${celebrities.length <= 2 ? "grid-cols-1 sm:grid-cols-2 max-w-2xl" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}
        >
          {celebrities.map((c) => (
            <Link key={c.id} href={`/celebrities/${c.slug}`} className={homeProductCard}>
              <div className={`${homeProductImage} aspect-square h-auto`}>
                {c.logo_url ? (
                  <Image
                    src={c.logo_url}
                    alt={c.name}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    className="object-contain p-4 transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-neutral-400 transition group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
                    {c.name.slice(0, 1)}
                  </span>
                )}
              </div>
              <div className="p-4 text-center">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{c.name}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
