import { homeHeading, homeSubheading, homeSectionLink } from "@/lib/home-classes";
import Link from "next/link";

type HomeSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
};

export function HomeSectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "Смотреть всё",
}: HomeSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            {eyebrow}
          </p>
        )}
        <h2 className={homeHeading}>{title}</h2>
        {description && <p className={homeSubheading}>{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className={`${homeSectionLink} group inline-flex items-center gap-2 shrink-0`}
        >
          {linkLabel}
          <span
            className="inline-block transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          >
            →
          </span>
        </Link>
      )}
    </div>
  );
}
