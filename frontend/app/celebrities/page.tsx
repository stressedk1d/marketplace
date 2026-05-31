import Image from "next/image";
import Link from "next/link";
import { fetchCelebrityBrands } from "@/lib/catalog-fetch";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { PageHero } from "@/app/components/PageHero";
import { ScrollReveal } from "@/app/components/home/ScrollReveal";
import {
  pageCelebrityImage,
  pageContent,
  pageEmptyState,
  pageGridBrands,
  pageProductCard,
  pageShell,
} from "@/lib/page-classes";

export const dynamic = "force-dynamic";

export default async function CelebritiesListPage() {
  const brands = await fetchCelebrityBrands();

  return (
    <div className={pageShell}>
      <div className={`${pageContent} pt-8 sm:pt-10`}>
        <Breadcrumbs items={[{ label: "Знаменитости" }]} />
        <PageHero
          eyebrow="Коллаборации"
          title="Знаменитости"
          description="Эксклюзивный мерч и коллаборации — отдельный раздел VogueWay."
          variant="dark"
        />
        {brands.length === 0 ? (
          <p className={pageEmptyState}>Список пуст.</p>
        ) : (
          <ScrollReveal>
            <div className={pageGridBrands}>
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/celebrities/${brand.slug}`}
                  className={`${pageProductCard} items-center text-center`}
                >
                  <div className={`${pageCelebrityImage} w-full`}>
                    {brand.logo_url ? (
                      <Image
                        src={brand.logo_url}
                        alt={brand.name}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 50vw, 20vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-neutral-400">
                        {brand.name.slice(0, 1)}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{brand.name}</p>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Мерч на маркетплейсе</p>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
