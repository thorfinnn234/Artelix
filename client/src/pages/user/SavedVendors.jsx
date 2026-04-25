import { useState, useEffect } from "react";
import { getSavedVendors } from "../../services/vendorService";
import UserLayout from "../../layouts/UserLayout";
import VendorCard from "../../components/VendorCard";

export default function SavedVendors() {
  const [vendors, setVendors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const fetchSaved = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSavedVendors();
      const list = Array.isArray(data) ? data : data.saved || data.vendors || [];
      setVendors(list);
    } catch (err) {
      setError("Failed to load saved vendors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSaved(); }, []);

  return (
    <UserLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900 
                       dark:text-gray-100">
          Saved Vendors
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Vendors you've bookmarked for later
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 text-red-600 
                        dark:text-red-400 text-sm px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-dark-border" />
                <div className="flex-1">
                  <div className="h-3.5 bg-gray-200 dark:bg-dark-border rounded mb-2 w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {!loading && vendors.length > 0 && (
        <>
          <p className="text-xs text-gray-400 mb-4">
            {vendors.length} saved vendor{vendors.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((item) => {
              const vendor = item.vendor || item;
              return (
                <VendorCard
                  key={vendor._id}
                  vendor={{ ...vendor, isSaved: true }}
                  onSaveToggle={fetchSaved}
                />
              );
            })}
          </div>
        </>
      )}

      {!loading && vendors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-500/10 
                          flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none"
                 stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="font-heading font-semibold text-gray-900 
                         dark:text-gray-100 mb-1">
            No saved vendors yet
          </h3>
          <p className="text-gray-400 text-sm text-center max-w-xs mb-4">
            Browse vendors and tap the heart icon to save them here
          </p>
          <a href="/user/home" className="btn-primary text-sm">
            Browse Vendors
          </a>
        </div>
      )}
    </UserLayout>
  );
}