import type { Metadata } from "next";
import Breadcrumbs from "@/app/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Свяжитесь с VogueWay — электронная почта, телефон и адрес. Мы всегда на связи.",
};

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-main py-10 sm:py-16">
        <Breadcrumbs items={[{ label: "Контакты" }]} />
        <h1 className="h32 mb-6">Контакты</h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text18 mb-2 font-semibold">Электронная почта</h2>
            <a
              href="mailto:support@vogueway.ru"
              className="text16 text-neutral-600 underline hover:text-neutral-900"
            >
              support@vogueway.ru
            </a>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text18 mb-2 font-semibold">Телефон</h2>
            <a
              href="tel:+78001234567"
              className="text16 text-neutral-600 hover:text-neutral-900"
            >
              8 (800) 123-45-67
            </a>
            <p className="text12 mt-1 text-neutral-400">Бесплатно по России</p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text18 mb-2 font-semibold">Режим работы</h2>
            <p className="text16 text-neutral-600">Пн — Пт: 09:00 — 20:00</p>
            <p className="text16 text-neutral-600">Сб — Вс: 10:00 — 18:00</p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text18 mb-2 font-semibold">Адрес</h2>
            <p className="text16 text-neutral-600">
              г.&nbsp;Москва, ул.&nbsp;Примерная, д.&nbsp;1, офис&nbsp;100
            </p>
          </div>
        </div>

        <section className="mt-12 max-w-xl">
          <h2 className="text24 mb-4 font-semibold">Напишите нам</h2>
          <p className="text16 text-neutral-600">
            Если у вас есть вопросы, предложения или вам нужна помощь —
            свяжитесь с нами любым удобным способом. Мы ответим в течение
            одного рабочего дня.
          </p>
        </section>
      </div>
    </div>
  );
}
