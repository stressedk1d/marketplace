"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/lib/CartContext";
import { apiUrl } from "@/lib/api";
import { useFocusTrap } from "@/lib/useFocusTrap";
import MiniCartDrawer from "@/app/components/MiniCartDrawer";
import SearchBar from "@/app/components/SearchBar";
import ThemeToggle from "@/app/components/ThemeToggle";
import { useHomeHeroHeader } from "@/lib/useHomeHeroHeader";
import { CartIcon, HeartIcon } from "@/app/components/icons/NavIcons";

const navItems = [
  { label: "Одежда", href: "/catalog?product_type=clothing" },
  { label: "Обувь", href: "/catalog?product_type=shoes" },
  { label: "Аксессуары", href: "/catalog?product_type=accessories" },
  { label: "Знаменитости", href: "/celebrities" },
  { label: "Бренды", href: "/brands" },
];

function isNavActive(
  pathname: string,
  searchParams: URLSearchParams,
  href: string,
): boolean {
  if (href === "/brands") {
    return pathname === "/brands" || pathname.startsWith("/brands/");
  }
  if (href === "/celebrities") {
    return pathname === "/celebrities" || pathname.startsWith("/celebrities/");
  }
  if (href.startsWith("/catalog?")) {
    const expected = new URLSearchParams(href.split("?")[1] ?? "");
    const expectedType = expected.get("product_type");
    if (pathname !== "/catalog") return false;
    return searchParams.get("product_type") === expectedType;
  }
  return pathname === href;
}

function navLinkClass(active: boolean, onDarkHero = false) {
  if (onDarkHero) {
    return active
      ? "font-semibold text-white underline underline-offset-4 decoration-2 decoration-white/80"
      : "text-white/75 transition hover:text-white";
  }
  return active
    ? "menu-text font-semibold underline underline-offset-4 decoration-2"
    : "menu-text hover:underline";
}

function headerPillPrimary(homeOverlay: boolean) {
  return homeOverlay
    ? "rounded-full border border-white/30 bg-white px-4 py-1.5 text-sm font-medium text-neutral-950 transition hover:bg-white/90"
    : "rounded-full bg-neutral-950 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200";
}

function headerPillOutline(homeOverlay: boolean) {
  return homeOverlay
    ? "rounded-full border border-white/30 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-white/10"
    : "rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800";
}

function CartButton({
  count,
  cartBump,
  onClick,
  className,
  iconClassName,
  badgeClassName,
}: {
  count: number;
  cartBump: boolean;
  onClick: () => void;
  className: string;
  iconClassName?: string;
  badgeClassName?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-label={`Корзина${count > 0 ? `, ${count} товаров` : ""}`}
    >
      <CartIcon size={18} className={iconClassName} />
      {count > 0 && (
        <span
          className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white lg:-right-4 lg:-top-2 ${badgeClassName ?? "bg-black"} ${cartBump ? "cart-badge-bump" : ""}`}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { count, refreshCart } = useCart();
  const [cartBump, setCartBump] = useState(false);
  const prevCountRef = useRef(0);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  useFocusTrap(menuPanelRef, menuOpen, () => setMenuOpen(false));

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (token) {
      refreshCart();
    } else {
      setIsAdmin(false);
    }
  }, [pathname, refreshCart]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAdmin(false);
      return;
    }
    const cached = sessionStorage.getItem("vw-is-admin");
    if (cached !== null) {
      setIsAdmin(cached === "1");
      return;
    }
    fetch(apiUrl("/admin/me"), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        setIsAdmin(r.ok);
        sessionStorage.setItem("vw-is-admin", r.ok ? "1" : "0");
      })
      .catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (count > prevCountRef.current && prevCountRef.current >= 0) {
      setCartBump(true);
      const t = setTimeout(() => setCartBump(false), 400);
      prevCountRef.current = count;
      return () => clearTimeout(t);
    }
    prevCountRef.current = count;
  }, [count]);

  useEffect(() => {
    const overflow = menuOpen || cartOpen;
    document.body.style.overflow = overflow ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, cartOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setMenuOpen(false);
    router.push("/login");
  };

  const openCart = () => {
    setMenuOpen(false);
    setCartOpen(true);
  };

  const onHome = pathname === "/";
  const homeOverlay = useHomeHeroHeader(pathname);
  const showDesktopCenterNav = homeOverlay || onHome;

  const headerSurface = homeOverlay
    ? `sticky top-0 z-50 border-b border-white/10 text-white backdrop-blur-md transition-[background-color,box-shadow,border-color,color] duration-500 ${
        scrolled ? "bg-neutral-950/90 shadow-lg shadow-black/20" : "bg-neutral-950/55"
      }`
    : `sticky top-0 z-30 border-b border-black/20 bg-[#f3f3f3]/95 backdrop-blur-sm transition-[background-color,box-shadow,border-color,color] duration-500 dark:border-white/15 dark:bg-[var(--background)]/95 ${
        scrolled ? "shadow-md" : ""
      }`;

  const logoClass = homeOverlay
    ? "max-h-10 w-auto object-contain brightness-0 invert transition-[filter] duration-500 md:max-h-12"
    : "max-h-10 w-auto object-contain transition-[filter] duration-500 md:max-h-12";

  return (
    <>
      <header className={headerSurface}>
        <div className="container-main py-3 md:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center border ${
                homeOverlay
                  ? "border-white/25 bg-white/10"
                  : "border-black bg-white dark:border-white/20 dark:bg-neutral-800"
              }`}
              aria-label="Открыть меню"
            >
              <span className="flex flex-col gap-1" aria-hidden>
                <span className={`block h-0.5 w-5 ${homeOverlay ? "bg-white" : "bg-black dark:bg-white"}`} />
                <span className={`block h-0.5 w-5 ${homeOverlay ? "bg-white" : "bg-black dark:bg-white"}`} />
                <span className={`block h-0.5 w-5 ${homeOverlay ? "bg-white" : "bg-black dark:bg-white"}`} />
              </span>
            </button>

            <Link href="/" className="flex flex-1 justify-center">
              <Image
                src="/logo.png"
                alt="VogueWay"
                width={120}
                height={48}
                priority
                className={logoClass}
              />
            </Link>

            <ThemeToggle compact />
            <Link
              href="/wishlist"
              className={`relative inline-flex min-h-11 min-w-11 items-center justify-center border ${
                homeOverlay
                  ? "border-white/25 bg-white/10"
                  : "border-black bg-white dark:border-white/20 dark:bg-neutral-800"
              }`}
              aria-label="Избранное"
            >
              <HeartIcon size={18} className={homeOverlay ? "text-white" : undefined} />
            </Link>

            <CartButton
              count={count}
              cartBump={cartBump}
              onClick={openCart}
              className={`relative inline-flex min-h-11 min-w-11 items-center justify-center border ${
                homeOverlay
                  ? "border-white/25 bg-white/10"
                  : "border-black bg-white dark:border-white/20 dark:bg-neutral-800"
              }`}
              iconClassName={homeOverlay ? "brightness-0 invert" : undefined}
              badgeClassName={homeOverlay ? "bg-white text-neutral-950" : undefined}
            />
          </div>

          <div
            className={`header-nav-row md:hidden ${homeOverlay ? "header-nav-row--hidden" : "header-nav-row--visible"}`}
          >
            <div className="mt-3">
              <SearchBar onNavigate={() => setMenuOpen(false)} />
            </div>
          </div>
        </div>

        <div className={`container-main hidden md:block ${homeOverlay ? "py-4" : "py-5"}`}>
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex h-12 shrink-0 items-center justify-center">
              <Image
                src="/logo.png"
                alt="VogueWay"
                width={140}
                height={56}
                priority
                className={logoClass}
              />
            </Link>

            {showDesktopCenterNav && (
              <nav className="hidden flex-1 items-center justify-center gap-5 lg:flex xl:gap-7">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={navLinkClass(isNavActive(pathname, searchParams, item.href), homeOverlay)}
                    aria-current={isNavActive(pathname, searchParams, item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}

            <div className="ml-auto flex flex-wrap items-center justify-end gap-3 lg:gap-5">
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" className={headerPillPrimary(homeOverlay)}>
                      Админ
                    </Link>
                  )}
                  <Link href="/account" className={headerPillOutline(homeOverlay)}>
                    Аккаунт
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`text16 hover:underline ${homeOverlay ? "text-white/75 hover:text-white" : "text-gray-600 dark:text-gray-400"}`}
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <Link href="/login" className={headerPillOutline(homeOverlay)}>
                  Войти
                </Link>
              )}
              <ThemeToggle compact />
              <Link
                href="/wishlist"
                className={`text16 inline-flex items-center gap-2 ${homeOverlay ? "text-white/90" : "dark:text-gray-200"}`}
              >
                <HeartIcon size={16} className={homeOverlay ? "text-white" : undefined} />
                <span className="hidden lg:inline">Избранное</span>
              </Link>
              <button
                type="button"
                onClick={openCart}
                className={`text16 relative inline-flex items-center gap-2 ${homeOverlay ? "text-white/90" : ""}`}
                aria-label={`Корзина${count > 0 ? `, ${count}` : ""}`}
              >
                <CartIcon size={16} className={homeOverlay ? "text-white" : undefined} />
                <span className="hidden lg:inline">Корзина</span>
                {count > 0 && (
                  <span
                    className={`absolute -right-4 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white ${
                      homeOverlay ? "bg-white text-neutral-950" : "bg-black"
                    } ${cartBump ? "cart-badge-bump" : ""}`}
                  >
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div
            className={`header-nav-row ${homeOverlay ? "header-nav-row--hidden" : "header-nav-row--visible"}`}
          >
            <div className={`flex flex-wrap items-center justify-between gap-4 ${onHome ? "pt-1" : "pt-0"}`}>
              {!onHome && (
                <nav className="flex flex-wrap items-center gap-4 lg:gap-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={navLinkClass(isNavActive(pathname, searchParams, item.href))}
                      aria-current={isNavActive(pathname, searchParams, item.href) ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              )}
              <SearchBar
                className={onHome ? "w-full max-w-none" : "min-w-[200px] flex-1 max-w-md"}
              />
            </div>
          </div>
        </div>

        {menuOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              aria-label="Закрыть меню"
              onClick={() => setMenuOpen(false)}
            />
            <div
              ref={menuPanelRef}
              className="fixed inset-y-0 left-0 z-50 flex w-[min(100%,20rem)] flex-col border-r border-neutral-200/90 bg-background p-5 shadow-xl animate-sheet-in-right dark:border-neutral-700 dark:bg-[var(--surface)] md:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="text-lg font-semibold dark:text-[var(--foreground)]">Меню</span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-10 min-w-10 items-center justify-center border border-black text-xl leading-none dark:border-white/25 dark:text-[var(--foreground)]"
                  aria-label="Закрыть"
                >
                  ×
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = isNavActive(pathname, searchParams, item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`rounded-lg px-3 py-3 text18 font-medium hover:bg-black/5 ${active ? "bg-black/5 font-semibold" : ""}`}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <Link href="/catalog" className="rounded-lg px-3 py-3 text18 font-medium hover:bg-black/5">
                  Каталог
                </Link>
              </nav>

              <div className="mt-6 flex flex-col gap-2 border-t border-black/10 pt-6">
                {isLoggedIn ? (
                  <>
                    {isAdmin && (
                      <Link href="/admin" className={`${headerPillPrimary(false)} block text-center`}>
                        Админ
                      </Link>
                    )}
                    <Link href="/account" className={`${headerPillOutline(false)} block text-center`}>
                      Аккаунт
                    </Link>
                    <Link href="/orders" className={`${headerPillOutline(false)} block text-center`}>
                      Мои заказы
                    </Link>
                    <button type="button" onClick={handleLogout} className="text16 py-2 text-gray-600">
                      Выйти
                    </button>
                  </>
                ) : (
                  <Link href="/login" className={`${headerPillPrimary(false)} block text-center`}>
                    Войти
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      <MiniCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
