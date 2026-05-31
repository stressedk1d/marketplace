import Link from "next/link";

export function HomeFinalCta() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-black px-8 py-14 text-center text-white sm:px-12 sm:py-16">
      <div
        className="hero-glow pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="hero-glow pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-amber-400/15 blur-3xl"
        aria-hidden
      />

      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
        Готовы обновить гардероб?
      </p>
      <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
        Найдите свой следующий образ уже сегодня
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-base text-white/70">
        Каталог с фильтрами, умный поиск по фото и быстрая доставка — всё в VogueWay.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/catalog"
          className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-neutral-900 transition hover:scale-[1.02] hover:bg-neutral-100 active:scale-[0.98]"
        >
          Перейти в каталог
        </Link>
        <Link
          href="/register"
          className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-white/30 px-8 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Создать аккаунт
        </Link>
      </div>
    </section>
  );
}
