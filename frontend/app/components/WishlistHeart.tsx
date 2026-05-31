"use client";

type WishlistHeartProps = {
  saved: boolean;
  disabled?: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
};

export default function WishlistHeart({
  saved,
  disabled,
  onToggle,
  size = "md",
}: WishlistHeartProps) {
  const dim = size === "sm" ? "text-xl" : "text-2xl";
  return (
    <button
      type="button"
      aria-label={saved ? "Убрать из избранного" : "Добавить в избранное"}
      aria-pressed={saved}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={`${dim} leading-none rounded-full border border-black/10 bg-white/90 p-1.5 shadow-sm transition hover:scale-110 hover:bg-white active:scale-95 disabled:opacity-50 ${saved ? "scale-110" : ""}`}
    >
      {saved ? "❤️" : "♡"}
    </button>
  );
}
