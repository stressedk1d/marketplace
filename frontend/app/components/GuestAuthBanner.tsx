import Link from "next/link";

export default function GuestAuthBanner({ message }: { message: string }) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text15 text-amber-900">{message}</p>
      <Link
        href="/login"
        className="inline-flex shrink-0 items-center justify-center rounded-md bg-black px-4 py-2 text14 text-white hover:bg-black/90"
      >
        Войти
      </Link>
    </div>
  );
}
