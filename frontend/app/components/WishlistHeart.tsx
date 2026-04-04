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
      className={`${dim} leading-none p-1.5 rounded-full bg-white/90 border border-black/10 shadow-sm hover:bg-white transition disabled:opacity-50`}
    >
      {saved ? "❤️" : "♡"}
    </button>
  );
}
