import Link from "next/link";
import { pageCtaPrimary } from "@/lib/page-classes";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export default function EmptyState({
  icon = "○",
  title,
  description,
  actionLabel,
  actionHref,
  secondaryLabel,
  secondaryHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-neutral-200/90 bg-white px-8 py-16 text-center shadow-sm ring-1 ring-black/[0.04] dark:border-neutral-700 dark:bg-[var(--surface)] dark:ring-white/[0.06]">
      <span className="mb-4 text-5xl text-neutral-300 dark:text-neutral-600" aria-hidden>
        {icon}
      </span>
      <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-50">{title}</h2>
      <p className="mb-6 max-w-md text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href={actionHref} className={`${pageCtaPrimary} !w-auto !min-w-[160px]`}>
          {actionLabel}
        </Link>
        {secondaryLabel && secondaryHref && (
          <Link
            href={secondaryHref}
            className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-neutral-300 px-6 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
