import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  /** light — светлый editorial; dark — как на главной */
  variant?: "light" | "dark";
  className?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  variant = "light",
  className = "",
}: PageHeroProps) {
  if (variant === "dark") {
    return (
      <section
        className={`relative overflow-hidden rounded-3xl bg-neutral-950 px-6 py-10 text-white sm:px-10 sm:py-12 ${className}`}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl"
          aria-hidden
        />
        <div className="relative max-w-2xl">
          {eyebrow && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.75rem] md:leading-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-300 sm:text-lg">
              {description}
            </p>
          )}
          {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-neutral-200/90 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-6 py-10 shadow-sm dark:border-neutral-700 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 sm:px-10 sm:py-12 ${className}`}
    >
      <div className="relative max-w-2xl">
        {eyebrow && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
            {description}
          </p>
        )}
        {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}
