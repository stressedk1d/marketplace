"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Сбрасывает прокрутку при смене страницы — привычное поведение для SPA. */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
