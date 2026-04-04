import Image from "next/image";
import Link from "next/link";
import { fetchTrendingProducts } from "@/lib/catalog-fetch";

const PLACEHOLDER = "/images/catalog-demo/nike-01.svg";

export async function TrendingProductsSection() {
  const products = await fetchTrendingProducts(8);

  return (
    <section className="animate-home-soft space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
            Trending Now
          </h2>
          <p className="mt-2 max-w-lg text-neutral-600">
            По числу просмотров карточки товара — данные с сервера (кэш ~1 мин).
          </p>
        </div>
        <Link
          href="/catalog"
          className="text-sm font-semibold text-neutral-900 underline-offset-4 transition hover:underline"
        >
          Весь каталог
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white/60 px-6 py-10 text-center text-neutral-500">
          Товары не загрузились.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => {
            const src = p.image_url?.trim() || PLACEHOLDER;
            return (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md"
              >
                <div className="relative h-52 w-full bg-neutral-200">
                  <Image
                    src={src}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  {p.brand && (
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                      {p.brand.name}
                    </p>
                  )}
                  <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-neutral-900">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-base font-semibold text-black">
                    {Math.round(p.price)} ₽
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
