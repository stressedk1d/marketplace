"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/lib/CartContext";

const navItems = [
  { label: "Одежда", href: "/catalog" },
  { label: "Обувь", href: "/catalog" },
  { label: "Аксессуары", href: "/catalog" },
  { label: "Знаменитости", href: "/celebrities" },
  { label: "Бренды", href: "/brands" },
];

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { count, refreshCart } = useCart();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (token) refreshCart();
  }, [pathname, refreshCart]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/catalog?search=${encodeURIComponent(q)}`);
  };

  return (
    <header className="bg-[#f3f3f3] border-b border-black/20">
      <div className="container-main py-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text16">г. Москва</p>
          <Link href="/" className="inline-flex h-12 items-center justify-center">
            <Image src="/logo.png" alt="VogueWay" width={140} height={56} priority className="max-h-12 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-5">
            {isLoggedIn ? (
              <Link href="/account" className="text16 border border-black px-4 py-1.5">
                Аккаунт
              </Link>
            ) : (
              <Link href="/login" className="text16 border border-black px-4 py-1.5">
                Войти
              </Link>
            )}
            <Link href="/wishlist" className="text16">
              Избранное
            </Link>
            <Link href="/cart" className="text16 relative">
              Корзина
              {count > 0 && (
                <span className="absolute -top-2 -right-4 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex flex-wrap items-center gap-6">
            {navItems.map((item) => (
              <span key={item.label} className="menu-text">
                <Link
                  href={item.href}
                  onClick={() => setActiveCategory(item.label)}
                  className="hover:underline"
                >
                  {item.label}
                </Link>
                {" "}
                <span>{activeCategory === item.label ? "|" : "/"}</span>
              </span>
            ))}
          </nav>

          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              placeholder="Поиск"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-52 h-9 border border-black px-3 text16 bg-transparent"
            />
            <button type="submit" className="h-9 px-4 bg-black text-white text16">
              🔍
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
