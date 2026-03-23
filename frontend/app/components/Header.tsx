"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    <header className="bg-[#f3f3f3] border-b border-black/20">
      <div className="container-main py-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text16">г. Москва</p>
          <Link href="/catalog" className="inline-flex h-12 items-center justify-center">
            <Image
              src="/logo.png"
              alt="Vogue Way"
              width={140}
              height={56}
              priority
              className="max-h-12 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-5">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="text16 border border-black px-4 py-1.5">
                Выйти
              </button>
            ) : (
              <Link href="/login" className="text16 border border-black px-4 py-1.5">
                Войти
              </Link>
            )}
            <Link href="/cart" className="text16">
              Корзина
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex flex-wrap items-center gap-6">
            <Link href="/catalog" className="menu-text hover:underline">
              Одежда /
            </Link>
            <Link href="/catalog" className="menu-text hover:underline">
              Обувь /
            </Link>
            <Link href="/catalog" className="menu-text hover:underline">
              Аксессуары /
            </Link>
            <Link href="/orders" className="menu-text hover:underline">
              Знаменитости /
            </Link>
            <Link href="/catalog" className="menu-text hover:underline">
              Бренды /
            </Link>
          </nav>

          <form className="flex items-center">
            <input
              type="text"
              placeholder="Поиск"
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
