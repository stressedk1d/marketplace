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
    <div className="min-h-screen py-10">
      <div className="container-main">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 border border-black/30">
          <div className="min-h-[420px] bg-[#d9d9d9]" />
          <div className="p-8 bg-[#f3f3f3]">
            <h1 className="h32 mb-3 text-center">Подтверждение аккаунта</h1>
            <p className="text16 text-center mb-6">
              Введите код подтверждения, отправленный в Telegram
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="text20">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border-b border-black bg-transparent mt-1 text20 outline-none"
                  required
                  placeholder="example@mail.com"
                />
              </div>
              <div>
                <label className="text20">Код из Telegram</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  className="w-full p-2 border-b border-black bg-transparent mt-1 text20 outline-none"
                  required
                  placeholder="000000"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text20 ${
                  loading ? "bg-gray-400 text-white" : "bg-[var(--accent-soft)] hover:brightness-95"
                }`}
              >
                {loading ? "Проверка..." : "Подтвердить"}
              </button>
            </form>

            {message ? (
              <p className={`mt-4 text-center text16 ${message.includes("успешно") ? "text-green-700" : "text-red-700"}`}>
                {message}
              </p>
            ) : null}
          </div>
        </div>
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
