"use client";

import { useState, Suspense } from "react"; // Убрали useEffect, так как он не используется
import { useRouter, useSearchParams } from "next/navigation";
import { apiUrl } from "@/lib/api";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Получаем email из URL (переданный после регистрации)
  const emailFromQuery = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(apiUrl("/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, verification_code: code }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Аккаунт успешно подтвержден! Перенаправление на вход...");
        setTimeout(() => {
          router.push("/login"); // Переход на страницу логина через 2 сек
        }, 2000);
      } else {
        setMessage(data.detail || "Ошибка при подтверждении");
      }
    } catch (error) {
      // Используем error для логирования, чтобы линтер был доволен
      console.error("Ошибка верификации:", error);
      setMessage("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">
          Подтверждение аккаунта
        </h1>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Введите 6-значный код, отправленный вашим ботом в Telegram
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
              required
              placeholder="example@mail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Код из Telegram
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="w-full p-2 border border-gray-300 rounded mt-1 text-center text-2xl tracking-widest text-black"
              required
              placeholder="000000"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded text-white font-semibold ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Проверка..." : "Подтвердить"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.includes("успешно") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
