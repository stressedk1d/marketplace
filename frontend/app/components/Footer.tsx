import Link from "next/link";

const footerColumns = [
  {
    title: "Покупателям",
    links: [
      { label: "Каталог", href: "/catalog" },
      { label: "Бренды", href: "/brands" },
      { label: "Знаменитости", href: "/celebrities" },
      { label: "Мои заказы", href: "/orders" },
      { label: "Избранное", href: "/wishlist" },
    ],
  },
  {
    title: "Помощь",
    links: [
      { label: "Частые вопросы", href: "/faq" },
      { label: "О компании", href: "/about" },
      { label: "Контакты", href: "/contacts" },
    ],
  },
  {
    title: "Правовая информация",
    links: [
      { label: "Пользовательское соглашение", href: "/terms" },
      { label: "Политика обработки данных", href: "/privacy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--footer-bg)] mt-8">
      <div className="container-main py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {footerColumns.map((column) => (
            <section key={column.title}>
              <h3 className="mb-4 text-lg font-semibold sm:text-xl">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label} className="text15">
                    <Link href={link.href} className="text-neutral-600 hover:text-black hover:underline transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section>
            <h3 className="mb-4 text-lg font-semibold sm:text-xl">
              Контакты
            </h3>
            <ul className="space-y-2 text15 text-neutral-600">
              <li>
                <a href="mailto:support@vogueway.ru" className="hover:text-black hover:underline transition-colors">
                  support@vogueway.ru
                </a>
              </li>
              <li>
                <a href="tel:+78001234567" className="hover:text-black hover:underline transition-colors">
                  8 (800) 123-45-67
                </a>
              </li>
              <li className="pt-2">
                <p className="text-neutral-500 text14">Ежедневно с 9:00 до 21:00</p>
              </li>
            </ul>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://t.me/vogueway"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 transition hover:bg-black hover:text-white"
                aria-label="Telegram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
              </a>
              <a
                href="https://vk.com/vogueway"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 transition hover:bg-black hover:text-white"
                aria-label="ВКонтакте"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.598-.188 1.368 1.259 2.184 1.814.616.42 1.084.328 1.084.328l2.178-.03s1.14-.07.6-.964c-.044-.073-.314-.661-1.618-1.869-1.366-1.265-1.183-1.06.462-3.246.998-1.328 1.398-2.14 1.273-2.487-.119-.331-.853-.244-.853-.244l-2.454.015s-.182-.025-.317.056c-.133.079-.218.264-.218.264s-.39 1.04-.91 1.924c-1.098 1.866-1.537 1.965-1.716 1.848-.417-.272-.313-1.092-.313-1.674 0-1.82.276-2.58-.537-2.778-.27-.066-.468-.11-1.157-.117-.884-.01-1.632.003-2.056.21-.282.138-.5.446-.367.464.163.022.534.1.73.366.253.343.244 1.113.244 1.113s.145 2.14-.34 2.404c-.333.182-.789-.189-1.769-1.894-.502-.874-.881-1.84-.881-1.84s-.073-.18-.203-.276c-.158-.117-.378-.154-.378-.154l-2.334.015s-.35.01-.479.163c-.114.135-.009.415-.009.415s1.838 4.3 3.92 6.467c1.907 1.988 4.07 1.857 4.07 1.857h.98z"/></svg>
              </a>
            </div>
          </section>
        </div>

        <div className="mt-8 border-t border-neutral-300 pt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text14 text-neutral-500">&copy; {new Date().getFullYear()} VogueWay. Все права защищены.</p>
          <p className="text14 text-neutral-400">Маркетплейс модной одежды, обуви и аксессуаров</p>
        </div>
      </div>
    </footer>
  );
}
