"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/catalog" className="text-2xl font-bold text-blue-600 tracking-tighter">
          SAVEPOINT
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/catalog" className="text-gray-600 hover:text-blue-600 font-medium transition text-sm">
            Каталог
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/orders" className="text-gray-600 hover:text-blue-600 font-medium transition text-sm">
                Заказы
              </Link>
              <Link
                href="/cart"
                className="text-gray-600 hover:text-blue-600 font-medium transition text-sm flex items-center gap-1"
              >
                <span>🛒</span> Корзина
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 text-sm font-medium transition"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition">
                Войти
              </Link>
              <Link
                href="/"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
