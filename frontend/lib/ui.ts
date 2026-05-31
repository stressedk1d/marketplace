import { pageCtaPrimary } from "@/lib/page-classes";

/** Оболочка страниц и карточек (корзина, checkout, аккаунт и т.д.). */
export const pageShell =
  "min-h-screen pb-12 text-neutral-900 dark:text-[var(--foreground)]";

export const pageCard =
  "rounded-2xl border border-neutral-200/90 bg-white shadow-sm ring-1 ring-black/[0.04] dark:border-neutral-700 dark:bg-[var(--surface)] dark:ring-white/[0.06]";

export const pageCardPadded = `${pageCard} p-5 sm:p-6`;

export const pageOutlineButton =
  "inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-600 dark:bg-[var(--surface)] dark:text-neutral-100 dark:hover:bg-neutral-800";

/** Общие классы форм и кнопок — согласованы с page-classes. */
export const uiForm = {
  input:
    "w-full rounded-xl border border-neutral-200/90 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-600 dark:bg-[var(--surface)] dark:text-neutral-100 dark:focus:border-neutral-500 dark:focus:ring-white/10",
  inputError: "border-red-400 focus:border-red-500 dark:border-red-500",
  label: "mb-1.5 block text-sm font-medium text-neutral-600 dark:text-neutral-400",
  error: "mt-1 text-xs text-red-600 dark:text-red-400",
  buttonPrimary: pageCtaPrimary,
  buttonSecondary:
    "inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 dark:border-neutral-600 dark:bg-[var(--surface)] dark:text-neutral-200 dark:hover:bg-neutral-800",
} as const;
