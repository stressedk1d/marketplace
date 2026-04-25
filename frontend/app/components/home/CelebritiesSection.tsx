import Image from "next/image";
import Link from "next/link";
import { fetchCelebrityBrands } from "@/lib/catalog-fetch";

export async function CelebritiesSection() {
  const celebrities = await fetchCelebrityBrands();

  return (
    <section className="animate-home-soft space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
            Celebrities
          </h2>
          <p className="mt-2 max-w-lg text-neutral-600">
            Мерч и коллаборации — отдельный раздел знаменитостей.
          </p>
        </div>
        <Link
          href="/celebrities"
          className="text-sm font-semibold text-neutral-900 underline-offset-4 transition hover:underline"
        >
          Все знаменитости
        </Link>
      </div>

      {celebrities.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white/60 px-6 py-10 text-center text-neutral-500">
          Знаменитости пока недоступны.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {celebrities.map((c) => (
            <Link
              key={c.id}
              href={`/celebrities/${c.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-lg"
            >
              <div className="relative aspect-square bg-neutral-200">
                {c.logo_url ? (
                  <Image
                    src={c.logo_url}
                    alt={c.name}
                    fill
                    unoptimized
                    className="object-contain p-4 transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-neutral-400 transition group-hover:text-neutral-600">
                    {c.name.slice(0, 1)}
                  </span>
                )}
              </div>
              <div className="p-4 text-center">
                <p className="font-semibold text-neutral-900">{c.name}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
