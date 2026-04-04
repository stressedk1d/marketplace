import Image from "next/image";
import Link from "next/link";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80";

export function HomeHero() {
  return (
    <section className="relative min-h-[min(78vh,720px)] w-full overflow-hidden bg-neutral-900">
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        priority
        className="object-cover opacity-90"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/30" />
      <div className="relative z-10 flex min-h-[min(78vh,720px)] flex-col items-center justify-center px-6 py-24 text-center text-white">
        <p className="animate-home-in mb-3 text-sm font-medium uppercase tracking-[0.25em] text-white/80">
          VogueWay
        </p>
        <h1 className="animate-home-in-delay max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Discover Your Style
        </h1>
        <p className="animate-home-in-delay mx-auto mt-6 max-w-xl text-lg text-white/85 sm:text-xl">
          Бренды, коллекции и лимитированные дропы — в одном маркетплейсе.
        </p>
        <div className="animate-home-in-delay mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/catalog"
            className="inline-flex min-h-[48px] min-w-[180px] items-center justify-center rounded-full bg-white px-8 py-3 text-base font-semibold text-neutral-900 shadow-lg transition hover:bg-neutral-100 hover:shadow-xl"
          >
            Смотреть каталог
          </Link>
          <Link
            href="/brands"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-white/80 bg-transparent px-8 py-3 text-base font-semibold text-white transition hover:bg-white/10"
          >
            Бренды
          </Link>
        </div>
      </div>
    </section>
  );
}
