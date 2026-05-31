"use client";

import { useState } from "react";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { PageHero } from "@/app/components/PageHero";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { pageContent, pageShell } from "@/lib/page-classes";

const faqItems = [
  {
    question: "Как оформить заказ?",
    answer:
      "Выберите товар в каталоге, добавьте в корзину и перейдите к оформлению. Укажите имя, телефон и адрес доставки, при желании — промокод (WELCOME10 или SAVE500), и подтвердите заказ. Для корзины и заказов нужен аккаунт.",
  },
  {
    question: "Какие способы доставки доступны?",
    answer:
      "В демо-версии VogueWay адрес доставки сохраняется в заказе. Реальная интеграция с курьерскими службами и ПВЗ — следующий этап развития проекта.",
  },
  {
    question: "Сколько стоит доставка?",
    answer:
      "На главной и в каталоге показан прогресс до бесплатной доставки от 5 000 ₽ — это UI-индикатор. Итоговая сумма в checkout включает только стоимость товаров и скидку по промокоду.",
  },
  {
    question: "Как вернуть товар?",
    answer:
      "Политика возврата описана в пользовательском соглашении. В текущей версии возврат оформляется через поддержку (support@vogueway.ru) — self-service в личном кабинете планируется позже.",
  },
  {
    question: "Какие способы оплаты поддерживаются?",
    answer:
      "На checkout можно выбрать карту, СБП или наложенный платёж — выбор сохраняется в заказе. Реальная оплата через платёжный шлюз в дипломной версии не подключена.",
  },
  {
    question: "Как создать аккаунт?",
    answer:
      "Нажмите «Регистрация» в меню, укажите email и пароль. После входа доступны корзина, избранное, заказы и программа лояльности (1% от суммы заказа баллами).",
  },
  {
    question: "Как отследить заказ?",
    answer:
      "В разделе «Мои заказы» отображаются статус, состав, адрес доставки и сумма. Администратор может менять статус в панели admin (оформлен → оплачен → отправлен → доставлен).",
  },
  {
    question: "Что такое визуальный поиск?",
    answer:
      "Загрузите фото в каталоге — CLIP-модель найдёт похожие товары по эмбеддингам. Первый запрос может занять время (загрузка модели). Если AI недоступен, используйте текстовый поиск и фильтры.",
  },
  {
    question: "Можно ли изменить или отменить заказ?",
    answer:
      "Отмена и смена статуса в демо доступны администратору. Покупатель видит актуальный статус в «Мои заказы». Для изменений до отправки — напишите в поддержку.",
  },
  {
    question: "Как связаться со службой поддержки?",
    answer:
      "Напишите на support@vogueway.ru или позвоните 8 (800) 123-45-67. Также есть страница «Контакты» с формой обратной связи.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className={pageShell}>
      <div className={`${pageContent} pt-8 sm:pt-10`}>
        <Breadcrumbs items={[{ label: "Частые вопросы" }]} />

        <PageHero
          eyebrow="Help"
          title="Частые вопросы"
          description="Ответы на популярные вопросы о заказах, доставке, оплате и возвратах."
          variant="light"
        />

        <ScrollReveal>
          <div className="mx-auto max-w-3xl space-y-3">
            {faqItems.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm ring-1 ring-black/[0.04] dark:border-neutral-700 dark:bg-[var(--surface)] dark:ring-white/[0.06]"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-neutral-50/80 dark:hover:bg-neutral-900/30"
                >
                  <span className="pr-4 text-sm font-semibold text-neutral-900 dark:text-neutral-50 sm:text-base">
                    {item.question}
                  </span>
                  <span
                    aria-hidden
                    className={`shrink-0 text-xl text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div id={`faq-answer-${idx}`} role="region" className="px-6 pb-5">
                    <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
            })}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
