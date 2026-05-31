"use client";

import { useI18n, type Locale } from "@/lib/I18nContext";

export default function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  const toggle = () => {
    const next: Locale = locale === "ru" ? "en" : "ru";
    setLocale(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full border border-black/15 bg-white px-2 text13 font-semibold uppercase transition hover:bg-black hover:text-white dark:border-white/20 dark:bg-neutral-800 dark:hover:bg-white dark:hover:text-black"
      aria-label={t("language")}
      title={t("language")}
    >
      {locale}
    </button>
  );
}
