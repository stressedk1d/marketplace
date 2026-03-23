"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Импортируем роутер
import { apiUrl } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter(); // Инициализируем роутер

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
        body: JSON.stringify({
          email: email,
          password: password,
          full_name: fullName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Успех! Переходим ко входу...");
        setTimeout(() => {
          router.push(`/login`);
        }, 1500);
      } else {
        setMessage("Ошибка: " + (data.detail || "Что-то пошло не так"));
      }
    } catch (error) {
      // Используем переменную error, чтобы линтер не ругался,
      // и выводим её в консоль для отладки
      console.error("Ошибка при регистрации:", error);
      setMessage(
        "Не удалось связаться с сервером. Проверь, запущен ли бэкенд."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10">
      <div className="container-main">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 border border-black/30">
          <div className="min-h-[460px] bg-[#d9d9d9]" />
          <form onSubmit={handleRegister} className="p-8 bg-[#f3f3f3] flex flex-col gap-4 text-black">
            <h1 className="h32 text-center">Регистрация</h1>
            <p className="text16 text-center">Создайте аккаунт для входа в приложение</p>

            <label className="text20 mt-2">ФИО</label>
            <input
              type="text"
              className="border-b border-black bg-transparent p-2 outline-none text20"
              placeholder="Иван Иванов"
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <label className="text20 mt-2">Email</label>
            <input
              type="email"
              className="border-b border-black bg-transparent p-2 outline-none text20"
              placeholder="mail@example.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="text20 mt-2">Пароль</label>
            <input
              type="password"
              className="border-b border-black bg-transparent p-2 outline-none text20"
              placeholder="********"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className={`mt-4 py-3 text20 ${
                loading ? "bg-gray-400 text-white" : "bg-[var(--accent-soft)] hover:brightness-95"
              }`}
            >
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>

            {message ? (
              <p className={`mt-2 text-center text16 ${message.includes("Ошибка") ? "text-red-700" : "text-green-700"}`}>
                {message}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}
