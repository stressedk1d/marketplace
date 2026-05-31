import Link from "next/link";

const VALUE_PROPS = [
  {
    icon: "🔍",
    title: "Поиск по фото",
    description:
      "Загрузите снимок — CLIP найдёт похожие товары в каталоге за секунды.",
    href: "/catalog",
    cta: "Попробовать",
  },
  {
    icon: "✨",
    title: "Коллекции и дропы",
    description:
      "Избранные линейки брендов и эксклюзивный мерч знаменитостей в одном месте.",
    href: "/catalog",
    cta: "К коллекциям",
  },
  {
    icon: "📦",
    title: "Быстрое оформление",
    description:
      "Корзина, выбор размера, промокоды и отслеживание заказа — без лишних шагов.",
    href: "/cart",
    cta: "В корзину",
  },
  {
    icon: "★",
    title: "Отзывы и рейтинг",
    description:
      "Реальные оценки покупателей помогают выбрать размер и модель уверенно.",
    href: "/catalog",
    cta: "Смотреть товары",
  },
] as const;

export function HomeValueProps() {
  return (
    <section className="space-y-8">
      <div className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
          Почему VogueWay
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl dark:text-neutral-50">
          Маркетплейс, который экономит время и вдохновляет
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {VALUE_PROPS.map((item) => (
          <article
            key={item.title}
            className="home-value-card group flex flex-col rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-[var(--surface)] dark:shadow-none"
          >
            <span
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-xl transition group-hover:scale-110 dark:bg-neutral-800"
              aria-hidden
            >
              {item.icon}
            </span>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              {item.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {item.description}
            </p>
            <Link
              href={item.href}
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-neutral-900 transition group-hover:gap-2 dark:text-neutral-200"
            >
              {item.cta}
              <span aria-hidden>→</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
