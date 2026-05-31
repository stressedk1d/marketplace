"use client";

import Image from "next/image";
import Link from "next/link";

const SHOWCASE = [
  {
    src: "/images/brands/nike/Nike Air Zoom Pegasus 41.webp",
    alt: "Nike Air Zoom Pegasus",
  },
  {
    src: "/images/brands/adidas/Adidas Forum Low3.webp",
    alt: "Adidas Forum",
  },
  {
    src: "/images/brands/nike/Nike Club Fleece Hoodie.webp",
    alt: "Nike Club Fleece Hoodie",
  },
  {
    src: "/images/brands/converse/Converse Chuck 702.webp",
    alt: "Converse Chuck 70",
  },
  {
    src: "/images/brands/new_balance/New Balance Q Speed Jacquard Tee2.webp",
    alt: "New Balance Tee",
  },
] as const;

const TRUST_ITEMS = [
  { value: "500+", label: "товаров" },
  { value: "AI", label: "поиск по фото" },
  { value: "4.8★", label: "рейтинг" },
];

export function HomeHero() {
  return (
    <section id="home-hero" className="relative -mt-[4.25rem] bg-neutral-950 text-white md:-mt-[4.75rem]">
      <div className="grid min-h-[100svh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Текст — всегда на сплошном тёмном фоне, без фото под буквами */}
        <div className="flex flex-col justify-center px-6 pb-10 pt-28 sm:px-10 sm:pb-14 sm:pt-32 lg:px-12 lg:py-20 xl:px-16">
          <p className="hero-stagger hero-stagger-1 mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
            Новый сезон 2026
          </p>

          <h1 className="hero-stagger hero-stagger-2 max-w-xl text-[clamp(2rem,5.5vw,3.75rem)] font-bold leading-[1.08] tracking-tight text-white">
            Маркетплейс модной одежды и обуви
          </h1>

          <p className="hero-stagger hero-stagger-3 mt-5 max-w-md text-base leading-relaxed text-neutral-300 sm:text-lg">
            Nike, Adidas, New Balance и мерч знаменитостей — с умным поиском по
            фото и быстрым оформлением заказа.
          </p>

          <div className="hero-stagger hero-stagger-4 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/catalog"
              className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-white px-8 text-[15px] font-semibold text-neutral-950 transition hover:bg-neutral-100 active:scale-[0.98]"
            >
              Смотреть каталог
            </Link>
            <Link
              href="/catalog?openVisualSearch=1"
              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 text-[15px] font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            >
              <CameraIcon />
              Поиск по фото
            </Link>
          </div>

          <div className="hero-stagger hero-stagger-5 mt-10 grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm sm:max-w-md sm:gap-0 sm:p-0 sm:divide-x sm:divide-white/10">
            {TRUST_ITEMS.map((item) => (
              <div key={item.label} className="px-2 text-center sm:px-5 sm:py-4">
                <p className="text-xl font-bold tabular-nums sm:text-2xl">{item.value}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wide text-neutral-400 sm:text-xs">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Витрина товаров — только реальные фото из каталога */}
        <div className="relative hidden min-h-[420px] bg-neutral-900 lg:block">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 p-1">
            {SHOWCASE.slice(0, 4).map((item, index) => (
              <div key={item.src} className="relative overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  priority={index === 0}
                  unoptimized
                  className="object-cover transition duration-700 hover:scale-105"
                  sizes="30vw"
                />
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-neutral-950/80 via-transparent to-transparent" />
          <div className="pointer-events-none absolute bottom-6 left-6 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs font-medium uppercase tracking-wider text-white/90 backdrop-blur-md">
            VogueWay · curated drop
          </div>
        </div>
      </div>

      {/* Мобильная полоска товаров */}
      <div className="border-t border-white/10 bg-neutral-900 px-4 py-4 lg:hidden">
        <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SHOWCASE.map((item) => (
            <div
              key={item.src}
              className="relative h-36 w-28 shrink-0 overflow-hidden rounded-xl border border-white/10"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                unoptimized
                className="object-cover"
                sizes="112px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CameraIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
