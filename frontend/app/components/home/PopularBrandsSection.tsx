import Image from "next/image";
import Link from "next/link";
import { fetchBrands } from "@/lib/catalog-fetch";

export async function PopularBrandsSection() {
  const brands = await fetchBrands();

  return (
    <section className="animate-home-soft space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
            Popular brands
          </h2>
          <p className="mt-2 max-w-lg text-neutral-600">
            Nike, Adidas и другие — переходите к коллекциям одним кликом.
          </p>
        </div>
        <Link
          href="/brands"
          className="text-sm font-semibold text-neutral-900 underline-offset-4 transition hover:underline"
        >
          Все бренды
        </Link>
      </div>

      {brands.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white/60 px-6 py-10 text-center text-neutral-500">
          Не удалось загрузить бренды. Проверьте, что API запущен.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/brands/${b.slug}`}
              className="group flex flex-col items-center rounded-2xl border border-neutral-200/90 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-lg"
            >
              <div className="relative mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 ring-1 ring-neutral-200 transition group-hover:ring-neutral-300">
                {b.logo_url ? (
                  <Image
                    src={b.logo_url}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-neutral-400 transition group-hover:text-neutral-600">
                    {b.name.slice(0, 1)}
                  </span>
                )}
              </div>
              <span className="text-lg font-semibold text-neutral-900">
                {b.name}
              </span>
              <span className="mt-1 text-sm text-neutral-500 transition group-hover:text-neutral-700">
                Коллекции →
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
