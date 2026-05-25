"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/lib/CartContext";
import { apiUrl } from "@/lib/api";

const navItems = [
  { label: "Одежда", href: "/catalog?product_type=clothing" },
  { label: "Обувь", href: "/catalog?product_type=shoes" },
  { label: "Аксессуары", href: "/catalog?product_type=accessories" },
  { label: "Знаменитости", href: "/celebrities" },
  { label: "Бренды", href: "/brands" },
];

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { count, refreshCart } = useCart();

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
    if (!token) { setIsAdmin(false); return; }
    const cached = sessionStorage.getItem("vw-is-admin");
    if (cached !== null) { setIsAdmin(cached === "1"); return; }
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
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setMenuOpen(false);
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setMenuOpen(false);
    router.push(`/catalog?search=${encodeURIComponent(q)}`);
  };

  const searchForm = (className: string) => (
    <form onSubmit={handleSearch} className={className}>
      <input
        type="search"
        placeholder="Поиск"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="min-h-11 flex-1 border border-black px-3 text16 bg-transparent"
      />
      <button
        type="submit"
        className="min-h-11 shrink-0 px-4 bg-black text-white text16 inline-flex items-center justify-center"
        aria-label="Искать"
      >
        <Image src="/search-icon.png" alt="Поиск" width={16} height={16} />
      </button>
    </form>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-black/20 bg-[#f3f3f3]">
      <div className="container-main py-3 md:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center border border-black bg-white"
            aria-label="Открыть меню"
          >
            <span className="flex flex-col gap-1" aria-hidden>
              <span className="block h-0.5 w-5 bg-black" />
              <span className="block h-0.5 w-5 bg-black" />
              <span className="block h-0.5 w-5 bg-black" />
            </span>
          </button>

          <Link href="/" className="flex flex-1 justify-center">
            <Image
              src="/logo.png"
              alt="VogueWay"
              width={120}
              height={48}
              priority
              className="max-h-10 w-auto object-contain"
            />
          </Link>

          <Link
            href="/wishlist"
            className="relative inline-flex min-h-11 min-w-11 items-center justify-center border border-black bg-white"
            aria-label="Избранное"
          >
            <Image src="/favorites-icon.png" alt="Избранное" width={18} height={18} />
          </Link>

          <Link
            href="/cart"
            className="relative inline-flex min-h-11 min-w-11 items-center justify-center border border-black bg-white"
            aria-label="Корзина"
          >
            <Image src="/cart-icon.png" alt="Корзина" width={18} height={18} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
        </div>

        <div className="mt-3">{searchForm("flex w-full gap-0")}</div>
      </div>

      <div className="container-main hidden py-5 md:block">
        <div className="mb-4 flex items-center gap-4">
          <Link href="/" className="inline-flex h-12 items-center justify-center">
            <Image
              src="/logo.png"
              alt="VogueWay"
              width={140}
              height={56}
              priority
              className="max-h-12 w-auto object-contain"
            />
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-3 lg:gap-5 ml-auto">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="text16 border border-black bg-black px-4 py-1.5 text-white">
                    Админ
                  </Link>
                )}
                <Link href="/account" className="text16 border border-black px-4 py-1.5">
                  Аккаунт
                </Link>
                <button type="button" onClick={handleLogout} className="text16 text-gray-600 hover:underline">
                  Выйти
                </button>
              </>
            ) : (
              <Link href="/login" className="text16 border border-black px-4 py-1.5">
                Войти
              </Link>
            )}
            <Link href="/wishlist" className="text16 inline-flex items-center gap-2">
              <Image src="/favorites-icon.png" alt="Избранное" width={16} height={16} />
              <span className="hidden lg:inline">Избранное</span>
            </Link>
            <Link href="/cart" className="text16 relative inline-flex items-center gap-2">
              <Image src="/cart-icon.png" alt="Корзина" width={16} height={16} />
              <span className="hidden lg:inline">Корзина</span>
              {count > 0 && (
                <span className="absolute -right-4 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex flex-wrap items-center gap-4 lg:gap-6">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="menu-text hover:underline">
                {item.label}
              </Link>
            ))}
          </nav>
          {searchForm("flex items-center")}
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
          <div className="fixed inset-y-0 left-0 z-50 flex w-[min(100%,20rem)] flex-col border-r border-black/20 bg-[#f3f3f3] p-5 shadow-xl md:hidden">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-semibold">Меню</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-10 min-w-10 items-center justify-center border border-black text-xl leading-none"
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-lg px-3 py-3 text18 font-medium hover:bg-black/5"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/catalog" className="rounded-lg px-3 py-3 text18 font-medium hover:bg-black/5">
                Каталог
              </Link>
            </nav>

            <div className="mt-6 flex flex-col gap-2 border-t border-black/10 pt-6">
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" className="text16 border border-black bg-black px-4 py-2.5 text-center text-white">
                      Админ
                    </Link>
                  )}
                  <Link href="/account" className="text16 border border-black px-4 py-2.5 text-center">
                    Аккаунт
                  </Link>
                  <Link href="/orders" className="text16 border border-black/30 px-4 py-2.5 text-center">
                    Мои заказы
                  </Link>
                  <button type="button" onClick={handleLogout} className="text16 py-2 text-gray-600">
                    Выйти
                  </button>
                </>
              ) : (
                <Link href="/login" className="text16 border border-black bg-black px-4 py-2.5 text-center text-white">
                  Войти
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
