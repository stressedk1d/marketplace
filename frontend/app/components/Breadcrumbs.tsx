import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Навигация" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
        <li>
          <Link
            href="/"
            className="transition hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Главная
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span aria-hidden className="text-neutral-300 dark:text-neutral-600">
              /
            </span>
            {item.href ? (
              <Link
                href={item.href}
                className="transition hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
