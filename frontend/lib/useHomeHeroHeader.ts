"use client";

import { useEffect, useState } from "react";

/** Пока hero главной в зоне видимости — шапка в «overlay»-режиме. */
export function useHomeHeroHeader(pathname: string) {
  const isHome = pathname === "/";
  const [inHero, setInHero] = useState(isHome);

  useEffect(() => {
    if (!isHome) {
      setInHero(false);
      return;
    }

    let raf = 0;

    const measure = () => {
      const hero = document.getElementById("home-hero");
      if (!hero) {
        setInHero(false);
        return;
      }
      const bottom = hero.getBoundingClientRect().bottom;
      setInHero(bottom > 140);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome]);

  return isHome && inHero;
}
