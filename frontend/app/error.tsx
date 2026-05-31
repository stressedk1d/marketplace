"use client";

import { useEffect } from "react";
import Link from "next/link";
import { pageCtaPrimary, pageShell } from "@/lib/page-classes";
import { pageOutlineButton } from "@/lib/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={`${pageShell} flex items-center justify-center`}>
      <div className="container-main py-16 text-center">
        <p className="text-6xl font-bold tracking-tighter text-neutral-200 dark:text-neutral-800">
          !
        </p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Что-то пошло не так
        </h1>
        <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400">
          Произошла ошибка при загрузке страницы. Попробуйте обновить или вернитесь на главную.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={() => reset()} className={`${pageCtaPrimary} !w-auto px-8`}>
            Повторить
          </button>
          <Link href="/" className={`${pageOutlineButton} !w-auto inline-flex px-8`}>
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
