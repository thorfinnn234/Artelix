import { useEffect, useState } from "react";
import { BadgeCheck, Star } from "lucide-react";
import { getArtisanReviews } from "../services/artisanService";

function Stars({ value, size = 14 }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={size} aria-hidden="true" className={star <= value ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"} />
      ))}
    </span>
  );
}

const formatDate = (value) => new Date(value).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });

// Reviews come only from customers who completed a booking with this artisan.
export default function VerifiedReviews({ artisanId, rating = 0 }) {
  const [data, setData] = useState({ items: [], total: 0, pages: 1, breakdown: {} });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getArtisanReviews(artisanId, { page, limit: 5 })
      .then((result) => {
        if (!active) return;
        setData((current) => ({ ...result, items: page === 1 ? result.items : [...current.items, ...result.items] }));
      })
      .catch((err) => active && setError(err.response?.data?.message || "Unable to load reviews."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [artisanId, page]);

  const { total, breakdown, items } = data;

  return (
    <section className="card mb-6" aria-labelledby="reviews-title">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div>
          <h2 id="reviews-title" className="font-heading font-semibold text-gray-900 dark:text-gray-100">Customer reviews</h2>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><BadgeCheck size={14} className="text-green-500" aria-hidden="true" /> Every review comes from a customer who completed a booking with this artisan.</p>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center">
              <p className="font-heading text-3xl font-bold text-gray-900 dark:text-gray-100">{Number(rating).toFixed(1)}</p>
              <Stars value={Math.round(rating)} />
              <p className="text-2xs text-gray-400 mt-1">{total} verified review{total === 1 ? "" : "s"}</p>
            </div>
            <dl className="flex flex-col gap-0.5 w-36" aria-label="Rating breakdown">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = breakdown?.[star] || 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-2xs text-gray-500">
                    <dt className="w-3">{star}</dt>
                    <dd className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-dark-border overflow-hidden">
                      <span className="block h-full bg-amber-400" style={{ width: `${total ? (count / total) * 100 : 0}%` }} />
                    </dd>
                    <span className="w-5 text-right">{count}</span>
                  </div>
                );
              })}
            </dl>
          </div>
        )}
      </div>

      {error && <p role="alert" className="booking-error">{error}</p>}
      {!loading && !error && total === 0 && (
        <p className="text-sm text-gray-400 py-6 text-center">No reviews yet. Reviews appear after customers complete a booking.</p>
      )}

      <ul className="flex flex-col divide-y divide-gray-100 dark:divide-dark-border">
        {items.map((review) => (
          <li key={review._id} className="py-4 first:pt-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 text-xs font-bold flex items-center justify-center shrink-0">{review.reviewer.name.charAt(0).toUpperCase()}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{review.reviewer.name}</p>
                  <p className="text-2xs text-gray-400 truncate">Verified booking · {review.jobTitle}</p>
                </div>
              </div>
              <div className="text-right">
                <Stars value={review.rating} />
                <p className="text-2xs text-gray-400">{formatDate(review.createdAt)}</p>
              </div>
            </div>
            {review.comment && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-line break-words">{review.comment}</p>}
          </li>
        ))}
      </ul>

      {loading && <p role="status" className="text-sm text-gray-400 py-2">Loading reviews…</p>}
      {!loading && page < data.pages && (
        <button type="button" className="btn-outline w-full mt-2" onClick={() => { setLoading(true); setError(""); setPage((p) => p + 1); }}>Show more reviews</button>
      )}
    </section>
  );
}
