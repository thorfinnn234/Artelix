import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveArtisan, unsaveArtisan } from "../services/artisanService";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`w-3.5 h-3.5 ${
              star <= Math.round(rating)
                ? "text-amber-400"
                : "text-gray-200 dark:text-gray-600"
            }`}
             fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
        {rating?.toFixed(1)}
      </span>
    </div>
  );
}

export default function ArtisanCard({ Artisan, onSaveToggle }) {
  const navigate = useNavigate();
  const [saved, setSaved]       = useState(Artisan.isSaved);
  const [saving, setSaving]     = useState(false);

  const handleSave = async (e) => {
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    try {
      if (saved) {
        await unsaveArtisan(Artisan._id);
        setSaved(false);
      } else {
        await saveArtisan(Artisan._id);
        setSaved(true);
      }
      onSaveToggle?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        onClick={() => navigate(`/user/artisan/${Artisan._id}`)}
        className="card cursor-pointer hover:border-green-500 
                   transition-all duration-200 group"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-green-50 dark:bg-green-500/10 
                            flex items-center justify-center shrink-0 
                            group-hover:bg-green-500 transition-colors">
              <span className="font-heading font-bold text-green-500 
                               group-hover:text-white transition-colors text-sm">
                {Artisan.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-semibold text-sm text-gray-900 
                             dark:text-gray-100 leading-tight truncate">
                {Artisan.name}
              </h3>
              <span className="badge-active text-2xs mt-0.5 inline-block">
                {Artisan.category}
              </span>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card 
                       transition-colors shrink-0"
          >
            <svg className={`w-4 h-4 transition-colors ${
                  saved ? "text-red-500 fill-red-500" : "text-gray-400 fill-none"
                }`}
                 stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Rating */}
        <StarRating rating={Artisan.rating} />

        {/* Address */}
        <div className="flex items-center gap-1.5 mt-3">
          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none"
               stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs text-gray-400 truncate">{Artisan.address}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 
                        border-t border-gray-100 dark:border-dark-border">
          <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full
            ${Artisan.status === "approved" ? "badge-active" :
              Artisan.status === "pending"  ? "badge-pending" : "badge-suspended"}`}>
            {Artisan.status}
          </span>
          <span className="text-2xs text-green-500 font-semibold shrink-0
                           group-hover:underline">
            View Details →
          </span>
        </div>
      </div>

    </>
  );
}
