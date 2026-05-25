"use client";

import { useState } from "react";
import Breadcrumbs from "@/app/components/Breadcrumbs";

const faqItems = [
  {
    question: "Как оформить заказ?",
    answer:
      "Выберите нужный товар в каталоге, добавьте его в корзину и перейдите к оформлению. Укажите адрес доставки, выберите способ оплаты и подтвердите заказ.",
  },
  {
    question: "Какие способы доставки доступны?",
    answer:
      "Мы предлагаем курьерскую доставку, доставку в пункты выдачи и почтовую доставку. Сроки и стоимость зависят от вашего региона и выбранного способа.",
  },
  {
    question: "Сколько стоит доставка?",
    answer:
      "Стоимость доставки рассчитывается автоматически при оформлении заказа и зависит от веса, размера посылки и адреса доставки. При заказе от определённой суммы доставка может быть бесплатной.",
  },
  {
    question: "Как вернуть товар?",
    answer:
      "Вы можете вернуть товар в течение 14 дней с момента получения, если он сохранил товарный вид и упаковку. Оформите возврат в личном кабинете в разделе «Мои заказы».",
  },
  {
    question: "Какие способы оплаты поддерживаются?",
    answer:
      "Мы принимаем банковские карты (Visa, Mastercard, Мир), оплату через СБП, а также наложенный платёж при получении в отдельных регионах.",
  },
  {
    question: "Как создать аккаунт?",
    answer:
      "Нажмите «Регистрация» в верхнем меню, укажите вашу электронную почту и придумайте пароль. После подтверждения почты аккаунт будет активирован.",
  },
  {
    question: "Как отследить заказ?",
    answer:
      "Перейдите в раздел «Мои заказы» в личном кабинете. Там отображается актуальный статус каждого заказа, а после отправки — трек-номер для отслеживания.",
  },
  {
    question: "Что делать, если товар пришёл с дефектом?",
    answer:
      "Свяжитесь с нашей службой поддержки через раздел «Контакты» или напишите на support@vogueway.ru. Мы организуем замену или возврат средств.",
  },
  {
    question: "Можно ли изменить или отменить заказ?",
    answer:
      "Вы можете отменить или изменить заказ до момента его передачи в доставку. Для этого перейдите в «Мои заказы» или обратитесь в поддержку.",
  },
  {
    question: "Как связаться со службой поддержки?",
    answer:
      "Напишите нам на support@vogueway.ru или позвоните по номеру 8 (800) 123-45-67 (бесплатно по России). Режим работы: Пн–Пт 09:00–20:00, Сб–Вс 10:00–18:00.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-main py-10 sm:py-16">
        <Breadcrumbs items={[{ label: "Частые вопросы" }]} />
        <h1 className="h32 mb-6">Частые вопросы</h1>

        <div className="max-w-3xl space-y-3">
          {faqItems.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-neutral-200 bg-white"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text18 font-medium pr-4">
                    {item.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-xl transition-transform duration-200"
                    style={{
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-question-${idx}`}
                  hidden={!isOpen}
                  className={isOpen ? "px-6 pb-5" : ""}
                >
                  {isOpen && (
                    <p className="text16 leading-relaxed text-neutral-600">
                      {item.answer}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
