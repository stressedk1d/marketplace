"use client";

import { ScrollReveal } from "@/app/components/ScrollReveal";

const values = [
  {
    title: "Качество",
    description:
      "Мы тщательно отбираем бренды и товары, чтобы каждая покупка соответствовала высоким стандартам.",
    icon: "✦",
  },
  {
    title: "Стиль",
    description:
      "Актуальные коллекции, тренды и подборки — всё, чтобы вы всегда выглядели безупречно.",
    icon: "◈",
  },
  {
    title: "Доступность",
    description:
      "Широкий ценовой диапазон и удобная доставка делают моду доступной для каждого.",
    icon: "○",
  },
];

export function AboutValues() {
  return (
    <section>
      <ScrollReveal>
        <h2 className="mb-6 text-xl font-semibold tracking-tight">Наши ценности</h2>
      </ScrollReveal>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {values.map((v, i) => (
          <ScrollReveal key={v.title} delay={i * 80}>
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-sm ring-1 ring-black/[0.04] dark:border-neutral-700 dark:bg-[var(--surface)] dark:ring-white/[0.06] sm:p-8">
              <span className="mb-4 block text-3xl text-neutral-400">{v.icon}</span>
              <h3 className="mb-2 font-semibold">{v.title}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{v.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

export function AboutApproach() {
  return (
    <ScrollReveal>
      <section className="max-w-3xl">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Наш подход</h2>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Команда VogueWay постоянно совершенствует платформу — от умного поиска по фото до
          персональных рекомендаций. Мы работаем напрямую с брендами, контролируя качество
          товаров и скорость доставки.
        </p>
      </section>
    </ScrollReveal>
  );
}
