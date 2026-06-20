import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ArtisanLayout from "../../layouts/ArtisanLayout";
import { getMyArtisan, getArtisan, getMyWorks } from "../../services/artisanService";
import { useAuth } from "../../context/AuthContext";

const DUMMY_JOBS = [
  { id: 1, user: "Amara Okafor",  avatar: "Amara",  service: "Fix leaking pipe",    status: "pending",  time: "2 mins ago" },
  { id: 2, user: "Chukwu Emeka", avatar: "Chukwu", service: "Install ceiling fan", status: "accepted", time: "1 hour ago" },
  { id: 3, user: "Fatima Bello", avatar: "Fatima", service: "Full house wiring",   status: "done",     time: "3 hours ago" },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((s) => (
        <svg key={s}
             className={`w-3.5 h-3.5 ${s <= Math.round(rating)
               ? "text-amber-400" : "text-gray-200 dark:text-gray-600"}`}
             fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
        {rating?.toFixed(1)}
      </span>
    </div>
  );
}

export default function ArtisanDashboard() {
  const { user }                    = useAuth();
  const [myArtisan, setMyArtisan]   = useState(null);  // ← renamed from Artisan
  const [artisanList, setArtisanList] = useState([]);  // ← new state for table
  const [works, setWorks]           = useState([]);
  const [worksTotal, setWorksTotal] = useState(0);
  const [loadingArtisan, setLoadingArtisan]   = useState(true);
  const [loadingList, setLoadingList]         = useState(true);
  const [loadingWorks, setLoadingWorks]       = useState(true);

  useEffect(() => {
    // Load my artisan profile
    getMyArtisan()
      .then((data) => setMyArtisan(data.artisan || data.Artisan || data))
      .catch(console.error)
      .finally(() => setLoadingArtisan(false));

    // Load all artisans for table
    getArtisan({ limit: 50 })
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data.items || data.artisans || [];
        setArtisanList(list);
      })
      .catch(console.error)
      .finally(() => setLoadingList(false));

    getMyWorks({ limit: 3 })
      .then((data) => {
        const list = Array.isArray(data) ? data : data.items || [];
        setWorks(list);
        setWorksTotal(data?.total ?? list.length);
      })
      .catch(console.error)
      .finally(() => setLoadingWorks(false));
  }, []);

  const statusBadge = (status) => ({
    pending:  "badge-pending",
    accepted: "badge-active",
    done:     "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-2xs font-semibold px-2.5 py-0.5 rounded-full",
  }[status] || "badge-pending");

  return (
    <ArtisanLayout>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
            Artisan Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage your business on Artelix
          </p>
        </div>
        <Link to="/artisan/listing"
              className="btn-primary flex items-center gap-2 text-sm w-full sm:w-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4v16m8-8H4" />
          </svg>
          Manage Listing
        </Link>
      </div>

      {/* Status Banner */}
      {!loadingArtisan && myArtisan && myArtisan.status !== "approved" && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2
                        ${myArtisan.status === "pending"
                          ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-200"
                          : "bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-200"}`}>
          {myArtisan.status === "pending" ? "⏳" : "🚫"}
          {myArtisan.status === "pending"
            ? "Your Artisan profile is pending admin approval."
            : `Your account has been ${myArtisan.status}. Contact support.`}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: "My Rating",      value: loadingArtisan ? "—" : `${myArtisan?.rating?.toFixed(1) || "0.0"}★` },
          { label: "Status",         value: loadingArtisan ? "—" : myArtisan?.status || "—" },
          { label: "Job Requests",   value: DUMMY_JOBS.length },
          { label: "Previous Works", value: loadingWorks ? "—" : worksTotal },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <p className="text-2xs text-gray-400 font-medium uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <p className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* My Listing Preview */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100">
              My Listing Preview
            </h2>
            <Link to="/artisan/listing"
                  className="text-sm text-green-500 font-semibold hover:underline">
              Edit →
            </Link>
          </div>

          {loadingArtisan ? (
            <div className="card">
              <div className="h-12 bg-gray-200 dark:bg-dark-border rounded mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-dark-border rounded mb-2 w-2/3" />
              <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-1/2" />
            </div>
          ) : (
            <div className="card hover:border-green-500 transition-all duration-200">
              <div className="flex items-center gap-3 mb-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center 
                                justify-center text-white font-bold text-lg shrink-0">
                  {myArtisan?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-semibold text-gray-900 
                                 dark:text-gray-100 text-sm">
                    {myArtisan?.name || "Your Business"}
                  </h3>
                  <span className="badge-active text-2xs">{myArtisan?.category}</span>
                </div>
              </div>
              <StarRating rating={myArtisan?.rating || 0} />
              <div className="flex items-center gap-1.5 mt-2">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none"
                     stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="text-xs text-gray-400">{myArtisan?.address}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none"
                     stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-xs text-gray-400">{myArtisan?.phone}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-border">
                <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full
                  ${myArtisan?.status === "approved" ? "badge-active" :
                    myArtisan?.status === "pending"  ? "badge-pending" : "badge-suspended"}`}>
                  {myArtisan?.status}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Recent Job Requests */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100">
              Recent Job Requests
            </h2>
            <Link to="/artisan/jobs"
                  className="text-sm text-green-500 font-semibold hover:underline">
              See all →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {DUMMY_JOBS.map((job) => (
              <div key={job.id} className="card flex items-center gap-3 min-w-0">
                <img
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${job.avatar}`}
                  alt={job.user}
                  className="w-10 h-10 rounded-full bg-green-50 border 
                             border-gray-100 dark:border-dark-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 
                                dark:text-gray-100 truncate">
                    {job.user}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{job.service}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={statusBadge(job.status)}>{job.status}</span>
                  <span className="text-2xs text-gray-300 dark:text-gray-600">
                    {job.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Previous Works */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100">
            Previous Works
          </h2>
          <Link to="/artisan/works"
                className="text-sm text-green-500 font-semibold hover:underline">
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loadingWorks && [...Array(3)].map((_, i) => (
            <div key={i} className="card">
              <div className="w-full h-32 rounded-lg bg-gray-200 dark:bg-dark-border mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-dark-border rounded mb-2 w-2/3" />
              <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-1/2" />
            </div>
          ))}

          {!loadingWorks && works.map((work) => (
            <div key={work._id}
                 className="card hover:border-green-500 transition-all duration-200">
              <img
                src={work.imageUrl}
                alt={work.title}
                className="w-full h-32 rounded-lg object-cover mb-3 bg-green-50 dark:bg-green-500/10"
              />
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                {work.title}
              </h3>
              <div className="flex items-center justify-between gap-2">
                <span className="badge-active text-2xs">{work.category}</span>
                <span className="text-2xs text-gray-400">
                  {new Date(work.createdAt).toLocaleDateString("en-NG", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}

          {/* Add new work */}
          <Link to="/artisan/works"
                className="card border-dashed border-2 border-gray-200 dark:border-dark-border 
                           flex flex-col items-center justify-center h-40 
                           hover:border-green-500 transition-all duration-200 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-500/10 
                            flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-green-500" fill="none"
                   stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-sm text-green-500 font-semibold">Add Work</p>
          </Link>
        </div>
      </div>

      {/* All Active Artisans Table */}
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100">
            Active Artisans
          </h2>
          <span className="text-2xs text-gray-400">
            {artisanList.length} artisans shown
          </span>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full responsive-table">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border">
                  {["Artisan", "Category", "Phone", "Location", "Rating", "Status"].map((h) => (
                    <th key={h}
                        className="text-left px-4 py-3 text-2xs font-semibold 
                                   text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingList ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}
                        className="border-b border-gray-50 dark:border-dark-border">
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-200 dark:bg-dark-border 
                                          rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : artisanList.length === 0 ? (
                  <tr>
                    <td colSpan={6}
                        className="px-4 py-8 text-center text-gray-400 text-sm">
                      No artisans found
                    </td>
                  </tr>
                ) : (
                  artisanList.map((item) => {
                    const a = item.artisan || item; // ← clean variable name
                    return (
                      <tr key={a._id}
                          className="border-b border-gray-50 dark:border-dark-border 
                                     hover:bg-gray-50 dark:hover:bg-dark-card 
                                     transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-green-50 
                                            dark:bg-green-500/10 flex items-center 
                                            justify-center shrink-0">
                              <span className="text-xs font-bold text-green-500">
                                {a.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 
                                             dark:text-gray-100 truncate max-w-[120px]">
                              {a.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="badge-active">{a.category}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {a.phone}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {a.address}
                        </td>
                        <td className="px-4 py-3">
                          <StarRating rating={a.rating} />
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full
                            ${a.status === "approved"  ? "badge-active"    :
                              a.status === "pending"   ? "badge-pending"   :
                              "badge-suspended"}`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </ArtisanLayout>
  );
}
