"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/CartContext";
import { CartIcon, HeartIcon, SearchIcon, UserIcon } from "@/app/components/icons/NavIcons";

const NAV = [
  { href: "/catalog", label: "Каталог", Icon: SearchIcon, match: (p: string) => p === "/catalog" || p.startsWith("/product") },
  { href: "/wishlist", label: "Избранное", Icon: HeartIcon, match: (p: string) => p === "/wishlist" },
  { href: "/cart", label: "Корзина", Icon: CartIcon, match: (p: string) => p === "/cart" || p === "/checkout" },
  { href: "/account", label: "Профиль", Icon: UserIcon, match: (p: string) => p === "/account" || p === "/orders" || p === "/login" },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { count } = useCart();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
  }, [pathname]);

  const profileHref = loggedIn ? "/account" : "/login";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200/90 bg-background/95 backdrop-blur-md dark:border-neutral-800 dark:bg-[var(--background)]/95 lg:hidden"
      aria-label="Основная навигация"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-1.5">
        {NAV.map((item) => {
          const href = item.href === "/account" ? profileHref : item.href;
          const active = item.match(pathname);
          const { Icon } = item;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={href}
                className={`relative flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-[11px] transition ${
                  active
                    ? "font-semibold text-neutral-900 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {item.href === "/cart" && count > 0 && (
                  <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-950 px-1 text-[10px] text-white dark:bg-white dark:text-neutral-950">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
