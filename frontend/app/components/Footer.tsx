import Link from "next/link";

const footerColumns = [
  {
    title: "Помощь",
    links: [
      { label: "Мои заказы", href: "/orders" },
      { label: "Частые вопросы", href: "/faq" },
    ],
  },
  {
    title: "О нас",
    links: [
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {footerColumns.map((column) => (
            <section key={column.title}>
              <h3 className="mb-4 text-xl font-semibold sm:text-2xl">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label} className="text16">
                    <Link href={link.href} className="hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </footer>
  );
}
