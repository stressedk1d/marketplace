"use client";

import Link from "next/link";
import { pageCtaPrimary, pageShell } from "@/lib/page-classes";
import { pageOutlineButton } from "@/lib/ui";

export default function OfflinePage() {
  return (
    <div className={`${pageShell} flex items-center justify-center px-4`}>
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-neutral-400"
            aria-hidden
          >
            <path d="M2 8.5a10 10 0 0 1 20 0" strokeLinecap="round" />
            <path d="M5 12.5a7 7 0 0 1 14 0" strokeLinecap="round" />
            <path d="M8.5 16a3.5 3.5 0 0 1 7 0" strokeLinecap="round" />
            <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
            <path d="M4 4l16 16" strokeLinecap="round" className="text-red-400" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Нет соединения
        </h1>
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
          Проверьте интернет и попробуйте снова. Некоторые страницы доступны офлайн.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={`${pageCtaPrimary} !w-auto inline-flex px-8`}
          >
            Обновить
          </button>
          <Link href="/" className={`${pageOutlineButton} !w-auto inline-flex px-8`}>
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
