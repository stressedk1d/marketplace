"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-20 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-black/20 bg-white text-lg shadow-lg transition hover:bg-neutral-100 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black lg:bottom-6 lg:right-6 ${
        visible
          ? "back-to-top-visible pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      aria-label="Наверх"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      ↑
    </button>
  );
}
