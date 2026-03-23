"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const footerColumns = [
  {
    title: "Помощь",
    links: [
      "Статус заказа по номеру",
      "Мои заказы",
      "Условия доставки",
      "Возврат",
      "Как оформить заказ",
      "Как выбрать размер",
      "Частые вопросы",
      "Поддержка",
    ],
  },
  {
    title: "О нас",
    links: ["Социальные сети", "Контакты", "Вакансии"],
  },
  {
    title: "Партнерам",
    links: [
      "Seller Academy",
      "Стать продавцом",
      "Стать поставщиком",
      "Стать партнером логистики",
      "Арендодателям",
    ],
  },
  {
    title: "Правовая информация",
    links: [
      "Публичная оферта",
      "Пользовательское соглашение",
      "Сотрудничество",
      "Политика обработки данных",
      "Конфиденциальная информация",
      "Комплаенс",
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <>
      {isHomePage ? (
        <section className="container-main py-10">
          <h2 className="h32 mb-4">Для клиентов</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {["Доставка", "Оплата", "Возврат"].map((item) => (
              <button
                key={item}
                type="button"
                className="text16 border border-black px-4 py-2 bg-white hover:bg-gray-100 transition"
              >
                {item}
              </button>
            ))}
          </div>
          <p className="text12 max-w-3xl text-gray-700">
            Информация по условиям отображается после выбора нужного раздела.
          </p>
        </section>
      ) : null}

      <footer className="bg-[var(--footer-bg)] mt-8">
        <div className="container-main py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {footerColumns.map((column) => (
              <section key={column.title}>
                <h3 className="h32 mb-4">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link} className="text16">
                      <Link href="#" className="hover:underline">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
