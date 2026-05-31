import Link from "next/link";
import { pageCtaPrimary, pageShell } from "@/lib/page-classes";
import { pageOutlineButton } from "@/lib/ui";

export default function NotFound() {
  return (
    <div className={`${pageShell} flex items-center justify-center`}>
      <div className="container-main py-16 text-center">
        <p className="text-8xl font-bold tracking-tighter text-neutral-200 sm:text-9xl dark:text-neutral-800">
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Страница не найдена
        </h1>
        <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400">
          К сожалению, запрашиваемая страница не существует или была перемещена.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className={`${pageCtaPrimary} !w-auto inline-flex px-8`}>
            На главную
          </Link>
          <Link
            href="/catalog"
            className={`${pageOutlineButton} !w-auto inline-flex px-8`}
          >
            Каталог товаров
          </Link>
        </div>
      </div>
    </div>
  );
}
