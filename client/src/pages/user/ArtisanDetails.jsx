import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getArtisanById,
  getArtisanWorks,
  rateArtisan,
  saveArtisan,
  unsaveArtisan,
} from "../../services/artisanService";
import { startArtisanConversation } from "../../services/messageService";
import UserLayout from "../../layouts/UserLayout";

function StarRating({ rating, size = "w-5 h-5" }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${size} ${
            star <= Math.round(rating || 0)
              ? "text-amber-400"
              : "text-gray-200 dark:text-gray-600"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ArtisanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artisan, setArtisan] = useState(null);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [worksLoading, setWorksLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [messageStarting, setMessageStarting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setWorksLoading(true);
    setError("");
    setMessage("");

    getArtisanById(id)
      .then((data) => {
        const nextArtisan = data.Artisan || data.artisan || data;
        setArtisan(nextArtisan);
        setSaved(Boolean(nextArtisan.isSaved));
        setSelectedRating(nextArtisan.myRating || 0);
      })
      .catch(() => setError("Artisan not found."))
      .finally(() => setLoading(false));

    getArtisanWorks(id)
      .then((data) => setWorks(Array.isArray(data) ? data : data.items || []))
      .catch(() => setWorks([]))
      .finally(() => setWorksLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (saving || !artisan) return;
    setSaving(true);
    setMessage("");

    try {
      if (saved) {
        await unsaveArtisan(artisan._id);
        setSaved(false);
        setMessage("Removed from saved artisans.");
      } else {
        await saveArtisan(artisan._id);
        setSaved(true);
        setMessage("Artisan saved.");
      }
    } catch (err) {
      setMessage(err?.response?.data?.message || "Unable to update saved artisan.");
    } finally {
      setSaving(false);
    }
  };

  const handleRating = async (rating) => {
    if (ratingSaving || !artisan) return;
    setSelectedRating(rating);
    setRatingSaving(true);
    setMessage("");

    try {
      const data = await rateArtisan(artisan._id, rating);
      setArtisan((current) => ({
        ...current,
        rating: data.rating,
        ratingCount: data.ratingCount,
        myRating: data.myRating,
      }));
      setMessage("Rating saved.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Unable to save rating.");
    } finally {
      setRatingSaving(false);
    }
  };

  const handleStartMessage = async () => {
    if (!artisan || messageStarting) return;
    setMessageStarting(true);
    setMessage("");

    try {
      const data = await startArtisanConversation(artisan._id);
      navigate(`/user/messages?conversation=${data.conversation._id}`);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Unable to start conversation.");
    } finally {
      setMessageStarting(false);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="max-w-5xl mx-auto">
          <div className="card h-56 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-48" />
            ))}
          </div>
        </div>
      </UserLayout>
    );
  }

  if (error || !artisan) {
    return (
      <UserLayout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <p className="text-red-500 mb-4">{error || "Artisan not found."}</p>
          <button onClick={() => navigate("/user/home")} className="btn-primary">
            Back to Browse
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {message && (
          <div className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-sm px-4 py-3 rounded-md mb-6">
            {message}
          </div>
        )}

        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center shrink-0">
                <span className="font-heading font-bold text-3xl text-green-500">
                  {artisan.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {artisan.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="badge-active">{artisan.category}</span>
                  <span className="text-xs text-gray-400 capitalize">{artisan.status}</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <StarRating rating={artisan.rating || 0} />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {(artisan.rating || 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({artisan.ratingCount || 0} rating{artisan.ratingCount === 1 ? "" : "s"})
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border w-full sm:w-auto ${
                saved
                  ? "bg-red-50 dark:bg-red-500/10 text-red-500 border-red-200 dark:border-red-500/30"
                  : "bg-green-50 dark:bg-green-500/10 text-green-500 border-green-200 dark:border-green-500/30"
              }`}
            >
              <svg className={`w-4 h-4 ${saved ? "fill-red-500" : "fill-none"}`} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {saving ? "Saving..." : saved ? "Saved" : "Save Artisan"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 card">
            <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Full Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Phone", value: artisan.phone },
                { label: "Address", value: artisan.address },
                { label: "Category", value: artisan.category },
                { label: "Member Since", value: formatDate(artisan.createdAt) },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg bg-gray-50 dark:bg-dark-card">
                  <p className="text-2xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {item.value || "N/A"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Rate This Artisan
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Your rating is saved and updates their profile average.
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRating(rating)}
                  disabled={ratingSaving}
                  className="p-1 rounded hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                  aria-label={`Rate ${rating} star${rating === 1 ? "" : "s"}`}
                >
                  <svg
                    className={`w-7 h-7 ${
                      rating <= selectedRating
                        ? "text-amber-400"
                        : "text-gray-200 dark:text-gray-600"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleStartMessage}
                disabled={messageStarting}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {messageStarting ? "Opening..." : "Message Artisan"}
              </button>
              <a href={`tel:${artisan.phone}`} className="btn-primary flex items-center justify-center gap-2">
                Call Artisan
              </a>
              <a
                href={`https://wa.me/${artisan.phone?.replace(/^0/, "234")}`}
                target="_blank"
                rel="noreferrer"
                className="btn-outline flex items-center justify-center gap-2"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100">
              Previous Works
            </h2>
            <span className="text-xs text-gray-400">
              {works.length} work{works.length === 1 ? "" : "s"}
            </span>
          </div>

          {worksLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card">
                  <div className="h-40 rounded-lg bg-gray-200 dark:bg-dark-border mb-3" />
                  <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : works.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {works.map((work) => (
                <div key={work._id} className="card hover:border-green-500 transition-all duration-200">
                  <img
                    src={work.imageUrl}
                    alt={work.title}
                    className="w-full h-44 object-cover rounded-lg mb-3 bg-green-50 dark:bg-green-500/10"
                  />
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                    {work.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">
                    {work.description}
                  </p>
                    <div className="flex items-center justify-between gap-2">
                    <span className="badge-active text-2xs">{work.category}</span>
                    <span className="text-2xs text-gray-400">{formatDate(work.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-sm text-gray-400">
                This artisan has not added previous works yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
