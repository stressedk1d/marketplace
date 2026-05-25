import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Навигация" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-14 text-gray-500">
        <li>
          <Link href="/" className="hover:text-black hover:underline">Главная</Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            <span aria-hidden>›</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-black hover:underline">{item.label}</Link>
            ) : (
              <span className="text-black">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
