"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Импортируем Link
import { apiUrl } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(apiUrl("/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        setMessage("Вход выполнен! Переходим в каталог...");

        setTimeout(() => {
          router.push("/catalog");
        }, 1500);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black">
      <form
        onSubmit={handleLogin}
        className="p-8 bg-white shadow-lg rounded-xl flex flex-col gap-4 w-96"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Вход в систему</h1>

        <label className="text-sm font-semibold">Email</label>
        <input
          type="email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="text-sm font-semibold">Пароль</label>
        <input
          type="password"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`p-2 rounded-lg font-bold text-white transition ${
            loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Вход..." : "Войти"}
        </button>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.includes("выполнен") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-sm mt-2">
          Нет аккаунта? {/* Заменили <a> на <Link> */}
          <Link href="/" className="text-blue-600 underline">
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </div>
  );
}
