"use client";

interface Review {
  id: number;
  user_name: string | null;
  rating: number;
  text: string | null;
  created_at: string | null;
}

interface ProductReviewsProps {
  reviews: Review[];
  avgRating?: number | null;
  reviewCount?: number;
  reviewRating: number;
  reviewText: string;
  onRatingChange: (rating: number) => void;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export default function ProductReviews({
  reviews,
  reviewRating,
  reviewText,
  onRatingChange,
  onTextChange,
  onSubmit,
  submitting,
}: ProductReviewsProps) {
  return (
    <div className="space-y-6">
      {reviews.length === 0 ? (
        <p className="text16 text-gray-500">Отзывов пока нет — будьте первым!</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-black/10 pb-4">
              <p className="font-semibold">{r.user_name ?? "Покупатель"}</p>
              <p className="text-amber-600 text14">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
              {r.text && <p className="mt-1 text15 text-gray-700">{r.text}</p>}
              {r.created_at && (
                <p className="mt-1 text13 text-gray-400">
                  {new Date(r.created_at).toLocaleDateString("ru-RU")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-lg border border-black/15 p-4">
        <h3 className="text18 font-semibold mb-3">Оставить отзыв</h3>
        <div className="mb-3 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onRatingChange(n)}
              className={`text-xl ${n <= reviewRating ? "text-amber-500" : "text-gray-300"}`}
              aria-label={`${n} звёзд`}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          value={reviewText}
          onChange={(e) => onTextChange(e.target.value)}
          rows={3}
          placeholder="Поделитесь впечатлением..."
          className="w-full border border-black/20 p-2 text15 resize-y"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="mt-3 rounded-md bg-black px-4 py-2 text15 text-white hover:bg-black/90 disabled:opacity-50"
        >
          {submitting ? "Отправка..." : "Отправить отзыв"}
        </button>
      </div>
    </div>
  );
}
