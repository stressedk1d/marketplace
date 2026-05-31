import type { Metadata } from "next";
import type { ReactNode } from "react";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { PageHero } from "@/app/components/PageHero";
import { pageContent, pageShell, pageSummaryCard } from "@/lib/page-classes";

export const metadata: Metadata = {
  title: "Политика обработки данных",
  description:
    "Политика обработки персональных данных VogueWay — как мы собираем, храним и используем ваши данные.",
};

const sections: { title: string; body: ReactNode }[] = [
  {
    title: "1. Общие положения",
    body: "Настоящая Политика обработки персональных данных (далее — Политика) определяет порядок сбора, хранения, обработки и защиты персональных данных пользователей интернет-магазина VogueWay (далее — Оператор). Политика разработана в соответствии с Федеральным законом № 152-ФЗ «О персональных данных».",
  },
  {
    title: "2. Какие данные мы собираем",
    body: (
      <>
        <p className="mb-2">При регистрации и оформлении заказов мы можем запрашивать следующие данные:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Фамилия, имя, отчество</li>
          <li>Адрес электронной почты</li>
          <li>Номер телефона</li>
          <li>Адрес доставки</li>
          <li>Данные об устройстве и браузере (автоматически)</li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Цели обработки данных",
    body: (
      <ul className="list-inside list-disc space-y-1">
        <li>Идентификация пользователя при оформлении заказа</li>
        <li>Связь с пользователем для уточнения деталей заказа</li>
        <li>Доставка товаров по указанному адресу</li>
        <li>Отправка уведомлений о статусе заказа</li>
        <li>Улучшение качества обслуживания и работы платформы</li>
      </ul>
    ),
  },
  {
    title: "4. Хранение и защита данных",
    body: "Персональные данные хранятся на защищённых серверах и не передаются третьим лицам, за исключением случаев, предусмотренных законодательством РФ, а также для исполнения обязательств по доставке (передача данных курьерской службе). Мы принимаем необходимые организационные и технические меры для защиты данных от несанкционированного доступа.",
  },
  {
    title: "5. Права пользователя",
    body: (
      <>
        Вы имеете право запросить информацию о хранящихся персональных данных, потребовать их
        изменения, уточнения или удаления. Для этого направьте запрос на адрес{" "}
        <a
          href="mailto:support@vogueway.ru"
          className="underline underline-offset-2 transition hover:text-neutral-900 dark:hover:text-white"
        >
          support@vogueway.ru
        </a>
        .
      </>
    ),
  },
  {
    title: "6. Файлы cookie",
    body: "Сайт использует файлы cookie для обеспечения корректной работы, аналитики и персонализации контента. Продолжая использовать сайт, вы соглашаетесь с использованием cookie. Вы можете отключить cookie в настройках браузера, однако это может повлиять на функциональность сайта.",
  },
  {
    title: "7. Контактная информация",
    body: (
      <>
        <p className="mb-2">По всем вопросам, связанным с обработкой персональных данных, обращайтесь:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>
            Email:{" "}
            <a
              href="mailto:support@vogueway.ru"
              className="underline underline-offset-2 transition hover:text-neutral-900 dark:hover:text-white"
            >
              support@vogueway.ru
            </a>
          </li>
          <li>Телефон: 8 (800) 123-45-67</li>
        </ul>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className={pageShell}>
      <div className={`${pageContent} pt-8 sm:pt-10`}>
        <Breadcrumbs items={[{ label: "Политика конфиденциальности" }]} />

        <PageHero
          eyebrow="Legal"
          title="Политика обработки персональных данных"
          description="Как VogueWay собирает, хранит и защищает ваши персональные данные."
          variant="light"
        />

        <div className={`${pageSummaryCard} mx-auto max-w-3xl space-y-8 !shadow-sm`}>
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-base font-semibold text-neutral-900 dark:text-neutral-50">
                {section.title}
              </h2>
              <div className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {section.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
