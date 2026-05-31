import Image from "next/image";
import Link from "next/link";

export function HomeEditorialBanner() {
  return (
    <section className="overflow-hidden rounded-3xl border border-neutral-200/90 bg-neutral-950 text-white shadow-xl dark:border-neutral-700">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[280px] lg:min-h-[420px]">
          <Image
            src="/images/brands/nike/Nike Club Fleece Hoodie.webp"
            alt="Nike Club Fleece Hoodie"
            fill
            unoptimized
            className="object-cover opacity-90"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/80" />
        </div>

        <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-amber-300/90">
            Редакционная подборка
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Уличный стиль и спорт — в одной витрине
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/75">
            Худи, кроссовки и аксессуары от Nike, Adidas и New Balance. Сравнивайте,
            сохраняйте в избранное и оформляйте заказ за пару минут.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalog?product_type=clothing"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
            >
              Одежда
            </Link>
            <Link
              href="/catalog?product_type=shoes"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/30 px-7 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Обувь
            </Link>
            <Link
              href="/celebrities"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/30 px-7 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Знаменитости
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
