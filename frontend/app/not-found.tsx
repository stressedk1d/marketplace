import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container-main py-16 text-center">
        <p className="text-8xl font-bold text-neutral-200 sm:text-9xl">404</p>
        <h1 className="h32 mt-4">Страница не найдена</h1>
        <p className="text18 mt-3 text-neutral-500">
          К сожалению, запрашиваемая страница не существует или была перемещена.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-block rounded-lg bg-neutral-900 px-6 py-3 text16 font-medium text-white transition hover:bg-neutral-700"
          >
            На главную
          </Link>
          <Link
            href="/catalog"
            className="inline-block rounded-lg border border-neutral-300 bg-white px-6 py-3 text16 font-medium text-neutral-900 transition hover:bg-neutral-100"
          >
            Каталог товаров
          </Link>
        </div>
      </div>
    </div>
  );
}
