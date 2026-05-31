import Link from "next/link";

type StepKey = "cart" | "checkout" | "done";

const STEPS: { key: StepKey; label: string; href: string }[] = [
  { key: "cart", label: "Корзина", href: "/cart" },
  { key: "checkout", label: "Оформление", href: "/checkout" },
  { key: "done", label: "Готово", href: "/orders" },
];

export default function CheckoutSteps({ current }: { current: StepKey }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  const progressPct = ((currentIdx + 1) / STEPS.length) * 100;

  return (
    <nav aria-label="Этапы оформления" className="mb-8">
      <div className="mb-4 h-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className="h-full rounded-full bg-neutral-950 transition-all duration-500 ease-out dark:bg-white"
          style={{ width: `${progressPct}%` }}
          role="progressbar"
          aria-valuenow={currentIdx + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
        />
      </div>

      <ol className="flex flex-wrap items-center gap-2 sm:gap-0">
        {STEPS.map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          const clickable = i < currentIdx;

          return (
            <li key={step.key} className="flex items-center">
              {i > 0 && (
                <span
                  className={`mx-2 hidden h-px w-6 sm:block sm:w-10 ${
                    done ? "bg-neutral-950 dark:bg-white" : "bg-neutral-200 dark:bg-neutral-700"
                  }`}
                  aria-hidden
                />
              )}
              {clickable ? (
                <Link
                  href={step.href}
                  className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 transition hover:border-neutral-400 dark:border-neutral-600 dark:bg-[var(--surface)] dark:text-neutral-300 dark:hover:border-neutral-500 sm:px-4"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs text-white dark:bg-emerald-500">
                    ✓
                  </span>
                  {step.label}
                </Link>
              ) : (
                <span
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm sm:px-4 ${
                    active
                      ? "border border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                      : "border border-neutral-200 bg-white text-neutral-400 dark:border-neutral-700 dark:bg-[var(--surface)] dark:text-neutral-500"
                  }`}
                  aria-current={active ? "step" : undefined}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      active
                        ? "bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white"
                        : "bg-neutral-100 text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {step.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
