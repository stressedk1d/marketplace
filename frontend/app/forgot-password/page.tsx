import Link from "next/link";
import { AuthSplitLayout } from "@/app/components/AuthSplitLayout";
import { pageCtaPrimary } from "@/lib/page-classes";

export default function ForgotPasswordPage() {
  return (
    <AuthSplitLayout
      title="Восстановление доступа"
      subtitle="Мы поможем вернуть доступ к аккаунту — напишите в поддержку, и команда ответит в течение рабочего дня."
    >
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Забыли пароль?
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Отправьте письмо на адрес поддержки с email, указанным при регистрации.
        </p>
        <a
          href="mailto:support@vogueway.ru"
          className={`${pageCtaPrimary} text-center`}
        >
          support@vogueway.ru
        </a>
        <Link
          href="/login"
          className="text-center text-sm text-neutral-500 transition hover:text-neutral-900 dark:hover:text-white"
        >
          ← Вернуться ко входу
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
