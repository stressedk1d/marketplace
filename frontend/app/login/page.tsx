"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiUrl } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("reason") === "session_expired";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        setMessage("Вход выполнен! Переходим в каталог...");
        setTimeout(() => router.push("/catalog"), 1500);
      } else {
        setMessage(data.detail || "Ошибка входа");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10">
      <div className="container-main">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 border border-black/30">
          <div className="min-h-[420px] bg-[#d9d9d9]" />
          <form onSubmit={handleLogin} className="p-8 bg-[#f3f3f3] flex flex-col gap-4 text-black">
            <h1 className="h32 text-center">Вход</h1>

            {sessionExpired && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 text16 text-center">
                Сессия истекла, войдите снова
              </div>
            )}

            <label className="text20 mt-2">Почта</label>
            <input
              type="email"
              className="border-b border-black bg-transparent p-2 outline-none text20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="text20 mt-2">Пароль</label>
            <input
              type="password"
              className="border-b border-black bg-transparent p-2 outline-none text20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className={`mt-4 py-3 text20 ${loading ? "bg-gray-400 text-white" : "bg-[var(--accent-soft)] hover:brightness-95"}`}
            >
              {loading ? "Вход..." : "Войти"}
            </button>

            {message && (
              <p className={`mt-2 text-center text16 ${message.includes("выполнен") ? "text-green-700" : "text-red-700"}`}>
                {message}
              </p>
            )}

            <p className="text-center text16 mt-2">
              Нет аккаунта?{" "}
              <Link href="/register" className="underline">Зарегистрироваться</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <LoginForm />
    </Suspense>
  );
}
