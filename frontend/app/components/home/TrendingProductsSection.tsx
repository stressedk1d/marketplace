import Image from "next/image";
import Link from "next/link";
import { fetchTrendingProducts } from "@/lib/catalog-fetch";
import { formatPrice } from "@/lib/format";
import { publicImageSrc } from "@/lib/image-src";
import {
  homeEmptyState,
  homeProductCard,
  homeProductImage,
} from "@/lib/home-classes";
import { HomeSectionHeader } from "./HomeSectionHeader";

const PLACEHOLDER = "/images/catalog-demo/nike-01.svg";

export async function TrendingProductsSection() {
  const products = await fetchTrendingProducts(8);

  return (
    <section className="space-y-8">
      <HomeSectionHeader
        eyebrow="Тренды"
        title="Сейчас в тренде"
        description="Самые просматриваемые товары на площадке прямо сейчас."
        href="/catalog"
        linkLabel="Весь каталог"
      />

      {products.length === 0 ? (
        <p className={homeEmptyState}>Товары не загрузились.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => {
            const src = publicImageSrc(p.image_url?.trim() || PLACEHOLDER);
            return (
              <Link key={p.id} href={`/product/${p.id}`} className={homeProductCard}>
                <div className={homeProductImage}>
                  <Image
                    src={src}
                    alt={p.name}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  {p.brand && (
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      {p.brand.name}
                    </p>
                  )}
                  <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-base font-semibold text-black dark:text-white">
                    {formatPrice(p.price)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
