import type { Metadata } from "next";
import Breadcrumbs from "@/app/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Политика обработки данных",
  description: "Политика обработки персональных данных VogueWay — как мы собираем, храним и используем ваши данные.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-main py-10 sm:py-16">
        <Breadcrumbs items={[{ label: "Политика конфиденциальности" }]} />
        <h1 className="h32 mb-6">Политика обработки персональных данных</h1>

        <div className="max-w-3xl space-y-8">
          <section>
            <h2 className="text20 mb-3 font-semibold">1. Общие положения</h2>
            <p className="text16 leading-relaxed text-neutral-600">
              Настоящая Политика обработки персональных данных (далее —
              Политика) определяет порядок сбора, хранения, обработки и защиты
              персональных данных пользователей интернет-магазина VogueWay
              (далее — Оператор). Политика разработана в соответствии с
              Федеральным законом №&nbsp;152-ФЗ «О персональных данных».
            </p>
          </section>

          <section>
            <h2 className="text20 mb-3 font-semibold">
              2. Какие данные мы собираем
            </h2>
            <p className="text16 leading-relaxed text-neutral-600">
              При регистрации и оформлении заказов мы можем запрашивать
              следующие данные:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text16 text-neutral-600">
              <li>Фамилия, имя, отчество</li>
              <li>Адрес электронной почты</li>
              <li>Номер телефона</li>
              <li>Адрес доставки</li>
              <li>Данные об устройстве и браузере (автоматически)</li>
            </ul>
          </section>

          <section>
            <h2 className="text20 mb-3 font-semibold">
              3. Цели обработки данных
            </h2>
            <ul className="list-inside list-disc space-y-1 text16 text-neutral-600">
              <li>Идентификация пользователя при оформлении заказа</li>
              <li>Связь с пользователем для уточнения деталей заказа</li>
              <li>Доставка товаров по указанному адресу</li>
              <li>Отправка уведомлений о статусе заказа</li>
              <li>Улучшение качества обслуживания и работы платформы</li>
            </ul>
          </section>

          <section>
            <h2 className="text20 mb-3 font-semibold">
              4. Хранение и защита данных
            </h2>
            <p className="text16 leading-relaxed text-neutral-600">
              Персональные данные хранятся на защищённых серверах и не
              передаются третьим лицам, за исключением случаев, предусмотренных
              законодательством РФ, а также для исполнения обязательств по
              доставке (передача данных курьерской службе). Мы принимаем
              необходимые организационные и технические меры для защиты данных
              от несанкционированного доступа.
            </p>
          </section>

          <section>
            <h2 className="text20 mb-3 font-semibold">
              5. Права пользователя
            </h2>
            <p className="text16 leading-relaxed text-neutral-600">
              Вы имеете право запросить информацию о хранящихся персональных
              данных, потребовать их изменения, уточнения или удаления. Для
              этого направьте запрос на адрес{" "}
              <a
                href="mailto:support@vogueway.ru"
                className="underline hover:text-neutral-900"
              >
                support@vogueway.ru
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text20 mb-3 font-semibold">
              6. Файлы cookie
            </h2>
            <p className="text16 leading-relaxed text-neutral-600">
              Сайт использует файлы cookie для обеспечения корректной работы,
              аналитики и персонализации контента. Продолжая использовать сайт,
              вы соглашаетесь с использованием cookie. Вы можете отключить
              cookie в настройках браузера, однако это может повлиять на
              функциональность сайта.
            </p>
          </section>

          <section>
            <h2 className="text20 mb-3 font-semibold">
              7. Контактная информация
            </h2>
            <p className="text16 leading-relaxed text-neutral-600">
              По всем вопросам, связанным с обработкой персональных данных,
              обращайтесь:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text16 text-neutral-600">
              <li>
                Email:{" "}
                <a
                  href="mailto:support@vogueway.ru"
                  className="underline hover:text-neutral-900"
                >
                  support@vogueway.ru
                </a>
              </li>
              <li>Телефон: 8 (800) 123-45-67</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
