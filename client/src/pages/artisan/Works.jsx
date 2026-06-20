import { useEffect, useState } from "react";
import ArtisanLayout from "../../layouts/ArtisanLayout";
import { createMyWork, getMyWorks } from "../../services/artisanService";

const initialForm = { title: "", category: "", description: "", photo: null };

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-NG", {
    month: "short",
    year: "numeric",
  });
}

export default function ArtisanWorks() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  const fetchWorks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyWorks();
      setWorks(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load previous works.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  useEffect(() => {
    if (!form.photo) {
      setPreview("");
      return;
    }

    const nextPreview = URL.createObjectURL(form.photo);
    setPreview(nextPreview);
    return () => URL.revokeObjectURL(nextPreview);
  }, [form.photo]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");

    const data = new FormData();
    data.append("title", form.title);
    data.append("category", form.category);
    data.append("description", form.description);
    data.append("photo", form.photo);

    try {
      const response = await createMyWork(data);
      const work = response.work || response.item || response;
      setWorks((current) => [work, ...current]);
      setForm(initialForm);
      setShowAdd(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to add work.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ArtisanLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
            Previous Works
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Showcase your completed jobs to attract more clients
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary flex items-center justify-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Work
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {showAdd && (
        <div className="card mb-6 border-green-200 dark:border-green-500/30">
          <h3 className="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Add New Work
          </h3>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">
                Project Title
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Kitchen Plumbing Repair"
                required
                className="input"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">
                Category
              </label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Plumbing"
                required
                className="input"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe what you did..."
                required
                rows={3}
                className="input resize-none"
              />
            </div>

            <label className="border-2 border-dashed border-gray-200 dark:border-dark-border rounded-lg p-4 text-center cursor-pointer hover:border-green-500 transition-colors">
              {preview ? (
                <img
                  src={preview}
                  alt="Selected work preview"
                  className="w-full h-48 object-cover rounded-md"
                />
              ) : (
                <div className="py-4">
                  <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Upload a photo of the completed work
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                required
                className="hidden"
                onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })}
              />
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="btn-outline flex-1"
                disabled={saving}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={saving}>
                {saving ? "Adding..." : "Add Work"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card">
              <div className="w-full h-36 rounded-lg bg-gray-200 dark:bg-dark-border mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-dark-border rounded mb-2 w-2/3" />
              <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-full" />
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
                className="w-full h-36 rounded-lg object-cover mb-3 bg-green-50 dark:bg-green-500/10"
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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-1">
            No previous works yet
          </h3>
          <p className="text-gray-400 text-sm max-w-xs mb-4">
            Add a photo and project details to start building your portfolio.
          </p>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">
            Add Work
          </button>
        </div>
      )}
    </ArtisanLayout>
  );
}
