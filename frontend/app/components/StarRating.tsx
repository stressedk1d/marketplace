interface StarRatingProps {
  rating: number;
  count?: number;
  size?: "sm" | "md";
}

export default function StarRating({ rating, count, size = "sm" }: StarRatingProps) {
  const rounded = Math.round(rating * 10) / 10;
  const full = Math.round(rounded);
  const textClass = size === "sm" ? "text12" : "text14";

  return (
    <div className={`inline-flex items-center gap-1 ${textClass} text-amber-600`} aria-label={`Рейтинг ${rounded} из 5`}>
      <span aria-hidden>{"★".repeat(Math.min(5, full))}</span>
      <span className="text-gray-400" aria-hidden>
        {"☆".repeat(Math.max(0, 5 - full))}
      </span>
      <span className="font-medium text-gray-700">{rounded.toFixed(1)}</span>
      {count !== undefined && count > 0 && (
        <span className="text-gray-400">({count})</span>
      )}
    </div>
  );
}
