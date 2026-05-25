import Image from "next/image";
import Link from "next/link";
import { fetchCelebrityBrands } from "@/lib/catalog-fetch";
import Breadcrumbs from "@/app/components/Breadcrumbs";

export default async function CelebritiesListPage() {
  const brands = await fetchCelebrityBrands();

  return (
    <div className="min-h-screen py-8">
      <div className="container-main text-black">
        <Breadcrumbs items={[{ label: "Знаменитости" }]} />
        <h1 className="h32 mb-8">Знаменитости</h1>
        {brands.length === 0 ? (
          <p className="text16 text-gray-500">Список пуст.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/celebrities/${brand.slug}`}
                className="group flex flex-col items-center gap-3"
              >
                <div className="relative aspect-square w-full overflow-hidden border border-black/10 bg-[#d9d9d9]">
                  {brand.logo_url ? (
                    <Image
                      src={brand.logo_url}
                      alt={brand.name}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-400">
                      {brand.name.slice(0, 1)}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p className="text16 font-semibold">{brand.name}</p>
                  <p className="text16 text-gray-500 text-sm">
                    Мерч на маркетплейсе
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
