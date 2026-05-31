"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCompareIds, clearCompare, MAX_COMPARE } from "@/lib/compare";
import { useI18n } from "@/lib/I18nContext";
import { pageCtaPrimary } from "@/lib/page-classes";
import { pageOutlineButton } from "@/lib/ui";

export default function CompareBar() {
  const [ids, setIds] = useState<number[]>([]);
  const { t } = useI18n();

  useEffect(() => {
    setIds(getCompareIds());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<number[]>).detail;
      setIds(Array.isArray(detail) ? detail : getCompareIds());
    };
    window.addEventListener("vw-compare-change", onChange);
    return () => window.removeEventListener("vw-compare-change", onChange);
  }, []);

  if (ids.length === 0) return null;

  return (
    <div className="fixed bottom-[4.75rem] left-0 right-0 z-40 border-t border-neutral-200/90 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md lg:bottom-0 dark:border-neutral-800 dark:bg-[var(--surface)]/95">
      <div className="container-main flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {t("compare")}: {ids.length}/{MAX_COMPARE}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => clearCompare()}
            className={`${pageOutlineButton} !w-auto !min-h-[40px] px-4 !text-sm`}
          >
            Очистить
          </button>
          <Link
            href="/compare"
            className={`${pageCtaPrimary} !w-auto !min-h-[40px] px-6 !text-sm`}
          >
            Сравнить
          </Link>
        </div>
      </div>
    </div>
  );
}
