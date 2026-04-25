"use client";

import { ui } from "@/app/catalog/ui/classes";

interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
  onPageChange: (nextOffset: number) => void;
}

export default function Pagination({
  total,
  limit,
  offset,
  onPageChange,
}: PaginationProps) {
  // UI governed by design system (tokens.ts + classes.ts)
  const navButtonClass =
    `${ui.button.secondary} text15 disabled:opacity-40`;

  if (total <= limit) return null;

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="py-8">
      <div className="flex items-center justify-between gap-3 md:hidden">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          disabled={!canPrev}
          className={navButtonClass}
        >
          Назад
        </button>
        <span className={ui.pill.counter}>
          {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(offset + limit)}
          disabled={!canNext}
          className={navButtonClass}
        >
          Вперед
        </button>
      </div>

      <div className="hidden items-center justify-center gap-2 md:flex">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          disabled={!canPrev}
          className={navButtonClass}
        >
          Назад
        </button>

        {pageNumbers.map((page) => {
          const pageOffset = (page - 1) * limit;
          const active = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(pageOffset)}
              className={`${ui.pill.page} ${
                active
                  ? ui.pill.pageActive
                  : ui.pill.pageIdle
              }`}
              aria-current={active ? "page" : undefined}
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(offset + limit)}
          disabled={!canNext}
          className={navButtonClass}
        >
          Вперед
        </button>
      </div>
      <p className="mt-3 text-center text14 text-gray-500">
        Страница {currentPage} из {totalPages}
      </p>
    </div>
  );
}
