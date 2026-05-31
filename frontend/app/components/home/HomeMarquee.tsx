const BRANDS = [
  "Nike",
  "Adidas",
  "New Balance",
  "Converse",
  "Puma",
  "Under Armour",
  "Billie Eilish",
  "Recrent",
  "VogueWay",
  "Essentials",
  "Streetwear",
  "Limited Drop",
];

export function HomeMarquee() {
  const items = [...BRANDS, ...BRANDS];

  return (
    <section
      className="relative overflow-hidden border-y border-black/10 bg-neutral-100 py-4 dark:border-white/10 dark:bg-neutral-900/80"
      aria-label="Партнёрские бренды"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-neutral-100 to-transparent dark:from-neutral-900/80" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-neutral-100 to-transparent dark:from-neutral-900/80" />

      <div className="home-marquee-track flex w-max items-center gap-10 px-4">
        {items.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="whitespace-nowrap text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
