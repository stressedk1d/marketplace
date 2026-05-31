import type { Metadata } from "next";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { PageHero } from "@/app/components/PageHero";
import { pageContent, pageShell, pageSummaryCard } from "@/lib/page-classes";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Свяжитесь с VogueWay — электронная почта, телефон и адрес. Мы всегда на связи.",
};

const contactCards = [
  {
    title: "Электронная почта",
    content: (
      <a
        href="mailto:support@vogueway.ru"
        className="text-sm text-neutral-600 underline-offset-2 transition hover:text-neutral-900 hover:underline dark:text-neutral-400 dark:hover:text-white"
      >
        support@vogueway.ru
      </a>
    ),
  },
  {
    title: "Телефон",
    content: (
      <>
        <a
          href="tel:+78001234567"
          className="text-sm text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          8 (800) 123-45-67
        </a>
        <p className="mt-1 text-xs text-neutral-400">Бесплатно по России</p>
      </>
    ),
  },
  {
    title: "Режим работы",
    content: (
      <>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Пн — Пт: 09:00 — 20:00</p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Сб — Вс: 10:00 — 18:00</p>
      </>
    ),
  },
  {
    title: "Адрес",
    content: (
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        г.&nbsp;Москва, ул.&nbsp;Примерная, д.&nbsp;1, офис&nbsp;100
      </p>
    ),
  },
];

export default function ContactsPage() {
  return (
    <div className={pageShell}>
      <div className={`${pageContent} pt-8 sm:pt-10`}>
        <Breadcrumbs items={[{ label: "Контакты" }]} />

        <PageHero
          eyebrow="Contact"
          title="Контакты"
          description="Мы на связи каждый день — выберите удобный способ и получите ответ в течение рабочего дня."
          variant="light"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contactCards.map((card) => (
            <div key={card.title} className={pageSummaryCard}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">
                {card.title}
              </h2>
              {card.content}
            </div>
          ))}
        </div>

        <section className={`${pageSummaryCard} max-w-2xl`}>
          <h2 className="mb-3 text-lg font-semibold">Напишите нам</h2>
          <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Если у вас есть вопросы, предложения или вам нужна помощь — свяжитесь с нами любым
            удобным способом. Мы ответим в течение одного рабочего дня.
          </p>
        </section>
      </div>
    </div>
  );
}
