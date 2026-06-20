import { useState, useEffect, useCallback } from "react";
import { getArtisan } from "../../services/artisanService";
import UserLayout from "../../layouts/UserLayout";
import ArtisanCard from "../../components/ArtisanCard";
import SearchBar from "../../components/SearchBar";
import CategoryFilter from "../../components/CategoryFilter";

export default function UserHome() {
  const [Artisan, setArtisan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    categories: 0,
    averageRating: 0,
  });

  const fetchArtisan = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        search: search || undefined,
        category: category || undefined,
        sort: sortBy || undefined,
      };

      const data = await getArtisan(params);
      const list = Array.isArray(data) ? data : data.items || data.Artisan || [];
      setArtisan(list);
      setStats({
        total: data?.stats?.total ?? list.length,
        approved: data?.stats?.approved ?? list.length,
        categories:
          data?.stats?.categories ??
          new Set(list.map((item) => item.category).filter(Boolean)).size,
        averageRating:
          data?.stats?.averageRating ??
          (list.length
            ? list.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) /
              list.length
            : 0),
      });
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load Artisan."
      );
    } finally {
      setLoading(false);
    }
  }, [search, category, sortBy]);

  useEffect(() => {
    const timer = setTimeout(fetchArtisan, 400);
    return () => clearTimeout(timer);
  }, [fetchArtisan]);

  const approvedArtisan = Artisan;
  const averageRating = Number(stats.averageRating) || 0;

  return (
    <UserLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1
          className="font-heading text-2xl font-bold text-gray-900 
                       dark:text-gray-100"
        >
          Browse Artisan
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Find trusted professionals near you
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Artisan", value: stats.total },
          { label: "Approved", value: stats.approved },
          { label: "Categories", value: stats.categories },
          { label: "Avg Rating", value: `${averageRating.toFixed(1)}\u2605` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-dark-card border border-gray-100 
                          dark:border-dark-border rounded-lg p-4"
          >
            <p
              className="text-2xs text-gray-400 font-medium uppercase 
                          tracking-wider mb-1"
            >
              {stat.label}
            </p>
            <p
              className="font-heading text-xl font-bold text-gray-900 
                          dark:text-gray-100"
            >
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
            <option value="rating_desc">Highest Rated</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="bg-red-50 dark:bg-red-500/10 text-red-600 
                        dark:text-red-400 text-sm px-4 py-3 rounded-md mb-6"
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card">
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

      {/* Artisan Grid */}
      {!loading && approvedArtisan.length > 0 && (
        <>
          <p className="text-xs text-gray-400 mb-4">
            Showing {approvedArtisan.length} Artisan
            {approvedArtisan.length !== 1 ? "s" : ""}
            {category ? ` in ${category}` : ""}
            {search ? ` matching "${search}"` : ""}
          </p>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
                          xl:grid-cols-4 gap-4"
          >
            {approvedArtisan.map((item) => {
              const Artisan = item.Artisan || item;
              return (
                <ArtisanCard
                  key={Artisan._id}
                  Artisan={Artisan}
                  onSaveToggle={fetchArtisan}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && approvedArtisan.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div
            className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-500/10 
                          flex items-center justify-center mb-4"
          >
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3
            className="font-heading font-semibold text-gray-900 
                         dark:text-gray-100 mb-1"
          >
            No Artisan found
          </h3>
          <p className="text-gray-400 text-sm text-center max-w-xs">
            {search || category
              ? "Try adjusting your search or filter"
              : "No approved Artisan yet. Check back soon!"}
          </p>
          {(search || category) && (
            <button
              onClick={() => {
                setSearch("");
                setCategory("");
              }}
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
