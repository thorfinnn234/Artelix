import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVendorById, saveVendor, unsaveVendor } from "../../services/vendorService";
import UserLayout from "../../layouts/UserLayout";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star}
             className={`w-5 h-5 ${star <= Math.round(rating)
               ? "text-amber-400" : "text-gray-200 dark:text-gray-600"}`}
             fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-base font-semibold text-gray-700 
                       dark:text-gray-300 ml-1">
        {rating?.toFixed(1)}
      </span>
    </div>
  );
}

export default function VendorDetails() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [vendor, setVendor]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    getVendorById(id)
      .then((data) => {
        const v = data.vendor || data;
        setVendor(v);
        setSaved(v.isSaved);
      })
      .catch(() => setError("Vendor not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (saved) {
        await unsaveVendor(vendor._id);
        setSaved(false);
      } else {
        await saveVendor(vendor._id);
        setSaved(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="max-w-2xl mx-auto animate-pulse">
          <div className="card mb-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gray-200 dark:bg-dark-border" />
              <div className="flex-1">
                <div className="h-5 bg-gray-200 dark:bg-dark-border rounded mb-2 w-1/2" />
                <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-1/3" />
              </div>
            </div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-dark-border 
                                     rounded mb-3" />
            ))}
          </div>
        </div>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => navigate("/user/home")} className="btn-primary">
            Back to Browse
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 
                     hover:text-gray-700 dark:hover:text-gray-300 mb-6 
                     transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Main Card */}
        <div className="card mb-4">

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-green-50 dark:bg-green-500/10 
                              flex items-center justify-center shrink-0">
                <span className="font-heading font-bold text-3xl text-green-500">
                  {vendor.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="font-heading text-xl font-bold text-gray-900 
                               dark:text-gray-100">
                  {vendor.name}
                </h1>
                <span className="badge-active mt-1 inline-block">
                  {vendor.category}
                </span>
                <div className="mt-2">
                  <StarRating rating={vendor.rating} />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm 
                         font-semibold transition-all duration-200 border
                         ${saved
                           ? "bg-red-50 dark:bg-red-500/10 text-red-500 border-red-200 dark:border-red-500/30"
                           : "bg-green-50 dark:bg-green-500/10 text-green-500 border-green-200 dark:border-green-500/30"
                         }`}
            >
              <svg className={`w-4 h-4 ${saved ? "fill-red-500" : "fill-none"}`}
                   stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {saved ? "Saved" : "Save"}
            </button>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: "Phone Number",
                value: vendor.phone,
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                ),
              },
              {
                label: "Address",
                value: vendor.address,
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                label: "Status",
                value: vendor.status,
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                label: "Member Since",
                value: new Date(vendor.createdAt).toLocaleDateString("en-NG", {
                  year: "numeric", month: "long", day: "numeric",
                }),
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.label}
                   className="flex items-start gap-3 p-3 rounded-lg 
                              bg-gray-50 dark:bg-dark-card">
                <div className="text-green-500 mt-0.5 shrink-0">{item.icon}</div>
                <div>
                  <p className="text-2xs text-gray-400 font-medium uppercase 
                                tracking-wider mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 
                                dark:text-gray-100 capitalize">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Card */}
        <div className="card">
          <h2 className="font-heading font-semibold text-gray-900 
                         dark:text-gray-100 mb-4">
            Contact Vendor
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            
              href={`tel:${vendor.phone}`}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            <a>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Vendor
            </a>
            
              href={`https://wa.me/${vendor.phone?.replace(/^0/, "234")}`}
              target="_blank"
              rel="noreferrer"
              className="btn-outline flex-1 flex items-center justify-center gap-2"
             <a>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.858L.057 23.547a.75.75 0 00.921.921l5.694-1.476A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.516-5.187-1.415l-.372-.22-3.853.999 1.02-3.73-.242-.384A9.954 9.954 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}