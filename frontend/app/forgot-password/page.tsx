import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen py-10">
      <div className="container-main">
        <div className="max-w-xl mx-auto border border-black/30 bg-[#f3f3f3] p-8 text-black">
          <h1 className="h32 text-center mb-6">Восстановление пароля</h1>

          <p className="text20 text-center mb-4">
            Для восстановления пароля обратитесь в поддержку по email:
          </p>

          <p className="text20 font-semibold text-center mb-8">
            support@vogueway.ru
          </p>

          <Link
            href="/login"
            className="block text-center text16 text-gray-500 hover:underline"
          >
            ← Вернуться ко входу
          </Link>
        </div>
      </div>
    </div>
  );
}
