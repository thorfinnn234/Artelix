import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ArtisanLayout from "../../layouts/ArtisanLayout";
import { getMyArtisan, updateMyArtisan } from "../../services/artisanService";
import useLocation from "../../hooks/useLocation";

const categories = [
  "Plumber",
  "Electrician",
  "Carpenter",
  "Painter",
  "Cleaner",
  "Mechanic",
  "Barber",
  "Hair Stylist",
  "Tailor",
  "AC Repair",
  "Generator Repair",
  "Phone Repair",
  "Web Developer",
  "Graphic Designer",
  "Photographer",
  "Caterer",
  "Other",
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-4 h-4 ${s <= Math.round(rating) ? "text-amber-400" : "text-gray-200 dark:text-gray-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
        {rating?.toFixed(1)}
      </span>
    </div>
  );
}

export default function ArtisanListing() {
  const [Artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    getMyArtisan()
      .then((data) => {
        const v = data.Artisan || data;
        setArtisan(v);
        setForm({
          name: v.name || "",
          category: v.category || "",
          phone: v.phone || "",
          address: v.address || "",
        });
      })
      .catch(() => setError("Failed to load listing."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };
  const { detectLocation, loading: locLoading } = useLocation();
  const [locError, setLocError] = useState("");

  const handleDetectLocation = async () => {
    setLocError("");
    try {
      const loc = await detectLocation();
      setForm({ ...form, address: loc.address });
    } catch (err) {
      setLocError(err);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await updateMyArtisan(form);
      setArtisan(data.Artisan || data);
      setSuccess("Listing updated successfully!");
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ArtisanLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
            My Listing
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            How your business appears to users on Artelix
          </p>
        </div>

        {/* Live Preview Card */}
        <div className="mb-6">
          <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Live Preview
          </h2>
          <div
            className="card border-green-200 dark:border-green-500/30 
                          bg-green-50/30 dark:bg-green-500/5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-12 h-12 rounded-xl bg-green-500 flex items-center 
                                justify-center text-white font-bold text-lg shrink-0"
                >
                  {(form.name || Artisan?.name || "V").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-semibold text-gray-900 dark:text-gray-100">
                    {form.name || Artisan?.name || "Your Business"}
                  </h3>
                  <span className="badge-active text-2xs mt-0.5 inline-block">
                    {form.category || Artisan?.category || "Category"}
                  </span>
                </div>
              </div>
              <span
                className={`text-2xs font-semibold px-2 py-0.5 rounded-full
                ${
                  Artisan?.status === "approved"
                    ? "badge-active"
                    : Artisan?.status === "pending"
                      ? "badge-pending"
                      : "badge-suspended"
                }`}
              >
                {Artisan?.status || "pending"}
              </span>
            </div>
            <StarRating rating={Artisan?.rating || 0} />
            <div className="flex items-center gap-1.5 mt-2">
              <svg
                className="w-3.5 h-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              <span className="text-xs text-gray-400">
                {form.address || Artisan?.address || "Your address"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <svg
                className="w-3.5 h-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="text-xs text-gray-400">
                {form.phone || Artisan?.phone || "Your phone"}
              </span>
            </div>
          </div>
        </div>

        {/* Manage Listing */}
        <div className="card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100">
              Manage Listing
            </h2>
            {!editing && !loading && (
              <button
                onClick={() => setEditing(true)}
                className="btn-primary text-sm"
              >
                Edit Listing
              </button>
            )}
          </div>

          {success && (
            <div
              className="bg-green-50 dark:bg-green-500/10 text-green-600 
                            dark:text-green-400 text-sm px-4 py-3 rounded-md mb-4 
                            flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {success}
            </div>
          )}

          {error && (
            <div
              className="bg-red-50 dark:bg-red-500/10 text-red-600 
                            dark:text-red-400 text-sm px-4 py-3 rounded-md mb-4"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-200 dark:bg-dark-border rounded-md"
                />
              ))}
            </div>
          ) : editing ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  className="text-xs font-semibold text-gray-600 
                                  dark:text-gray-400 mb-1.5 block"
                >
                  Business Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your business name"
                  required
                  className="input"
                />
              </div>
              <div>
                <label
                  className="text-xs font-semibold text-gray-600 
                                  dark:text-gray-400 mb-1.5 block"
                >
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="text-xs font-semibold text-gray-600 
                                  dark:text-gray-400 mb-1.5 block"
                >
                  Phone Number
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="08012345678"
                  pattern="(?:\+234|234|0)[789][01][0-9\s-]{8,12}"
                  title="Enter a valid Nigerian phone number."
                  required
                  className="input"
                />
              </div>
              <div>
                <label
                  className="text-xs font-semibold text-gray-600 
                                  dark:text-gray-400 mb-1.5 block"
                >
                  Address
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Street/area, city, state"
                  minLength={12}
                  title="Include area and city/state, separated by commas."
                  required
                  className="input"
                />
                <p className="text-2xs text-gray-400 mt-1">
                  Use a specific service address, for example: 12 Admiralty Way, Lekki, Lagos.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-3">
              {[
                { label: "Business Name", value: Artisan?.name },
                { label: "Category", value: Artisan?.category },
                { label: "Phone", value: Artisan?.phone },
                { label: "Address", value: Artisan?.address },
                {
                  label: "Rating",
                  value: `${Artisan?.rating?.toFixed(1) || "0.0"} / 5.0`,
                },
                { label: "Status", value: Artisan?.status },
                {
                  label: "Member Since",
                  value: Artisan?.createdAt
                    ? new Date(Artisan.createdAt).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center py-2 border-b 
                                border-gray-100 dark:border-dark-border last:border-0"
                >
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    {item.label}
                  </span>
                  <span
                    className="text-sm font-semibold text-gray-900 
                                   dark:text-gray-100 sm:text-right break-words capitalize"
                  >
                    {item.value || "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ArtisanLayout>
  );
}
