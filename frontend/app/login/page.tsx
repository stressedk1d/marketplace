"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiUrl } from "@/lib/api";
import { uiForm } from "@/lib/ui";
import { pageCtaPrimary } from "@/lib/page-classes";
import { AuthPageSkeleton } from "@/app/components/ProductGridSkeleton";
import { AuthSplitLayout } from "@/app/components/AuthSplitLayout";

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
    } catch {
      setMessage("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      title="С возвращением"
      subtitle="Мода и стиль в одном месте. Войдите, чтобы продолжить покупки и отслеживать заказы."
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Вход
        </h1>

        {sessionExpired && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
            Сессия истекла — войдите снова
          </div>
        )}

        <div>
          <label className={uiForm.label}>Почта</label>
          <input
            type="email"
            className={uiForm.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={uiForm.label}>Пароль</label>
          <input
            type="password"
            className={uiForm.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Link
          href="/forgot-password"
          className="self-end text-sm text-neutral-500 transition hover:text-neutral-900 dark:hover:text-white"
        >
          Забыли пароль?
        </Link>

        <button type="submit" disabled={loading} className={pageCtaPrimary}>
          {loading ? "Вход..." : "Войти"}
        </button>

        {message && (
          <p
            className={`text-center text-sm ${
              message.includes("выполнен") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
          Нет аккаунта?{" "}
          <Link href="/register" className="font-semibold text-neutral-900 underline dark:text-neutral-200">
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </AuthSplitLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthPageSkeleton label="Загрузка" />}>
      <LoginForm />
    </Suspense>
  );
}
