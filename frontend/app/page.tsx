"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Импортируем роутер
import { apiUrl } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter(); // Инициализируем роутер

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [tgId, setTgId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(apiUrl("/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
          full_name: fullName,
          telegram_id: tgId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Успех! Переходим к подтверждению...");
        // Редирект на страницу верификации с передачей email в URL
        setTimeout(() => {
          router.push(`/verify?email=${encodeURIComponent(email)}`);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black">
      <form
        onSubmit={handleRegister}
        className="p-8 bg-white shadow-lg rounded-xl flex flex-col gap-4 w-96"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Регистрация</h1>

        <label className="text-sm font-semibold">ФИО</label>
        <input
          type="text"
          className="border p-2 rounded"
          placeholder="Иван Иванов"
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <label className="text-sm font-semibold">Email</label>
        <input
          type="email"
          className="border p-2 rounded"
          placeholder="mail@example.com"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="text-sm font-semibold">Пароль</label>
        <input
          type="password"
          className="border p-2 rounded"
          placeholder="********"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="text-sm font-semibold">Telegram ID</label>
        <input
          type="text"
          className="border p-2 rounded"
          placeholder="12345678"
          onChange={(e) => setTgId(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } text-white p-2 rounded-lg font-bold transition`}
        >
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </button>

        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              message.includes("Ошибка") ? "text-red-600" : "text-blue-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
