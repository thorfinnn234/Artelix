import { useState, useEffect, useCallback } from "react";
import { getVendors } from "../../services/vendorService";
import UserLayout from "../../layouts/UserLayout";
import VendorCard from "../../components/VendorCard";
import SearchBar from "../../components/SearchBar";
import CategoryFilter from "../../components/CategoryFilter";

export default function UserHome() {
  const [vendors, setVendors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy]     = useState("newest");

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getVendors({
        search,
        category,
        sort: sortBy,
      });
      // handle both array and wrapped response
      const list = Array.isArray(data) ? data : data.vendors || [];
      setVendors(list);
    } catch (err) {
      setError("Failed to load vendors. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, category, sortBy]);

  useEffect(() => {
    const timer = setTimeout(fetchVendors, 400);
    return () => clearTimeout(timer);
  }, [fetchVendors]);

  const approvedVendors = vendors.filter((v) => {
    const vendor = v.vendor || v;
    return vendor.status === "approved";
  });

  return (
    <UserLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900 
                       dark:text-gray-100">
          Browse Vendors
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Find trusted professionals near you
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Vendors", value: vendors.length },
          { label: "Approved",      value: approvedVendors.length },
          { label: "Categories",    value: "50+" },
          { label: "Avg Rating",    value: "4.5★" },
        ].map((stat) => (
          <div key={stat.label}
               className="bg-white dark:bg-dark-card border border-gray-100 
                          dark:border-dark-border rounded-lg p-4">
            <p className="text-2xs text-gray-400 font-medium uppercase 
                          tracking-wider mb-1">
              {stat.label}
            </p>
            <p className="font-heading text-xl font-bold text-gray-900 
                          dark:text-gray-100">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name or category..."
          />
        </div>
        <div className="sm:w-52">
          <CategoryFilter value={category} onChange={setCategory} />
        </div>
        <div className="sm:w-44">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input"
          >
            <option value="newest">Newest First</option>
            <option value="rating">Highest Rated</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 text-red-600 
                        dark:text-red-400 text-sm px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-dark-border" />
                <div className="flex-1">
                  <div className="h-3.5 bg-gray-200 dark:bg-dark-border rounded mb-2 w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-dark-border rounded mb-3 w-1/3" />
              <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Vendors Grid */}
      {!loading && approvedVendors.length > 0 && (
        <>
          <p className="text-xs text-gray-400 mb-4">
            Showing {approvedVendors.length} vendor{approvedVendors.length !== 1 ? "s" : ""}
            {category ? ` in ${category}` : ""}
            {search ? ` matching "${search}"` : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
                          xl:grid-cols-4 gap-4">
            {approvedVendors.map((item) => {
              const vendor = item.vendor || item;
              return (
                <VendorCard
                  key={vendor._id}
                  vendor={vendor}
                  onSaveToggle={fetchVendors}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && approvedVendors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-500/10 
                          flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none"
                 stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="font-heading font-semibold text-gray-900 
                         dark:text-gray-100 mb-1">
            No vendors found
          </h3>
          <p className="text-gray-400 text-sm text-center max-w-xs">
            {search || category
              ? "Try adjusting your search or filter"
              : "No approved vendors yet. Check back soon!"}
          </p>
          {(search || category) && (
            <button
              onClick={() => { setSearch(""); setCategory(""); }}
              className="btn-ghost mt-4 text-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </UserLayout>
  );
}