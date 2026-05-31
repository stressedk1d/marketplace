"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiUrl } from "@/lib/api";
import { uiForm } from "@/lib/ui";
import { pageCtaPrimary } from "@/lib/page-classes";
import { AuthSplitLayout } from "@/app/components/AuthSplitLayout";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(apiUrl("/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Регистрация успешна! Переходим ко входу...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setMessage("Ошибка: " + (data.detail || "Что-то пошло не так"));
      }
    } catch {
      setMessage("Не удалось связаться с сервером. Проверьте, что API запущен.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Присоединяйтесь"
      subtitle="Создайте аккаунт — сохраняйте избранное, оформляйте заказы и получайте персональные подборки."
    >
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Регистрация
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Заполните форму — это займёт меньше минуты
        </p>

        <div>
          <label className={uiForm.label}>ФИО</label>
          <input
            type="text"
            className={uiForm.input}
            placeholder="Иван Иванов"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={uiForm.label}>Email</label>
          <input
            type="email"
            className={uiForm.input}
            placeholder="mail@example.com"
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
            placeholder="Минимум 6 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} className={pageCtaPrimary}>
          {loading ? "Регистрация..." : "Создать аккаунт"}
        </button>

        {message && (
          <p
            className={`text-center text-sm ${
              message.includes("Ошибка") ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-semibold text-neutral-900 underline dark:text-neutral-200">
            Войти
          </Link>
        </p>
      </form>
    </AuthSplitLayout>
  );
}
