import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { getAdminStats, getAdminArtisan } from "../../services/adminService";

function StatCard({ label, value, sub, color, icon }) {
  const colors = {
    green:  "bg-green-50 dark:bg-green-500/10 text-green-500",
    amber:  "bg-amber-50 dark:bg-amber-500/10 text-amber-500",
    red:    "bg-red-50 dark:bg-red-500/10 text-red-500",
    blue:   "bg-blue-50 dark:bg-blue-500/10 text-blue-500",
    purple: "bg-purple-50 dark:bg-purple-500/10 text-purple-500",
    gray:   "bg-gray-100 dark:bg-gray-700 text-gray-500",
  };

  return (
    <div className="card flex items-start gap-3 sm:gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center 
                       shrink-0 ${colors[color] || colors.green}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xs text-gray-400 font-medium uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </p>
        {sub && <p className="text-2xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// Simple bar chart using pure CSS
function SimpleBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-2xs text-gray-400 font-semibold">{d.value}</span>
          <div className="w-full rounded-t-md transition-all duration-500"
               style={{
                 height:     `${Math.max((d.value / max) * 80, 4)}px`,
                 background: d.color || "#1e7a40",
               }} />
          <span className="text-2xs text-gray-400 truncate w-full text-center">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats]             = useState(null);
  const [recentArtisan, setRecentArtisan] = useState([]);
  const [pendingArtisan, setPendingArtisan] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminStats(),
      getAdminArtisan({ limit: 5, sort: "newest" }),
      getAdminArtisan({ limit: 5, status: "pending" }),
    ])
      .then(([statsData, recentData, pendingData]) => {
        setStats(statsData);
        setRecentArtisan(recentData.items || []);
        setPendingArtisan(pendingData.items || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats ? [
    { label: "Approved",  value: stats.approvedArtisan,  color: "#1e7a40" },
    { label: "Pending",   value: stats.pendingArtisan,   color: "#f59e0b" },
    { label: "Suspended", value: stats.suspendedArtisan, color: "#ef4444" },
    { label: "Rejected",  value: stats.rejectedArtisan,  color: "#6b7280" },
  ] : [];

  return (
    <AdminLayout pendingCount={stats?.pendingArtisan || 0}>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Overview of Artelix platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <StatCard
          label="Total Users" color="blue"
          value={loading ? "—" : stats?.totalUsers || 0}
          sub="Registered users"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>}
        />
        <StatCard
          label="Total Artisan" color="green"
          value={loading ? "—" : stats?.totalArtisan || 0}
          sub="All Artisan"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>}
        />
        <StatCard
          label="Pending Approvals" color="amber"
          value={loading ? "—" : stats?.pendingArtisan || 0}
          sub="Awaiting review"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <StatCard
          label="Approved Artisan" color="green"
          value={loading ? "—" : stats?.approvedArtisan || 0}
          sub="Active on platform"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <StatCard
          label="Suspended" color="red"
          value={loading ? "—" : stats?.suspendedArtisan || 0}
          sub="Suspended Artisan"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>}
        />
        <StatCard
          label="Rejected" color="gray"
          value={loading ? "—" : stats?.rejectedArtisan || 0}
          sub="Rejected Artisan"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
      </div>

      {/* Charts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Artisan Status Chart */}
        <div className="lg:col-span-2 card">
          <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Artisan Overview
          </h2>
          {loading ? (
            <div className="h-28 bg-gray-100 dark:bg-dark-border rounded" />
          ) : (
            <SimpleBarChart data={chartData} />
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-col gap-2">
            {[
              { label: "Review Pending",   to: "/admin/approvals", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10" },
              { label: "Manage Artisan",   to: "/admin/artisan",   color: "text-green-600 bg-green-50 dark:bg-green-500/10" },
              { label: "Manage Users",     to: "/admin/users",     color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10" },
              { label: "View Reported",    to: "/admin/reported",  color: "text-red-600 bg-red-50 dark:bg-red-500/10" },
            ].map((action) => (
              <Link key={action.label} to={action.to}
                    className={`flex items-center justify-between gap-3 px-4 py-3 
                               rounded-lg text-sm font-semibold transition-opacity 
                               hover:opacity-80 ${action.color}`}>
                {action.label}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingArtisan.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100">
              Pending Approvals
              <span className="ml-2 bg-amber-500 text-white text-2xs font-bold 
                               px-2 py-0.5 rounded-full">
                {pendingArtisan.length}
              </span>
            </h2>
            <Link to="/admin/approvals"
                  className="text-sm text-green-500 font-semibold hover:underline">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingArtisan.map((Artisan) => (
              <div key={Artisan._id} className="card border-amber-200 dark:border-amber-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 
                                  flex items-center justify-center shrink-0">
                    <span className="font-bold text-amber-500">
                      {Artisan.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                      {Artisan.name}
                    </p>
                    <p className="text-2xs text-gray-400">{Artisan.category}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-3 truncate">{Artisan.address}</p>
                <Link to="/admin/approvals"
                      className="btn-primary w-full text-xs text-center py-2">
                  Review →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Artisan Signups */}
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100">
            Latest Artisan Signups
          </h2>
          <Link to="/admin/artisan"
                className="text-sm text-green-500 font-semibold hover:underline">
            See all →
          </Link>
        </div>
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full responsive-table">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border">
                  {["Artisan", "Category", "Location", "Status", "Joined"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-2xs font-semibold 
                                           text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-200 dark:bg-dark-border rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recentArtisan.map((Artisan) => (
                  <tr key={Artisan._id}
                      className="border-b border-gray-50 dark:border-dark-border 
                                 hover:bg-gray-50 dark:hover:bg-dark-card transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-500/10 
                                        flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-green-500">
                            {Artisan.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 
                                         dark:text-gray-100 truncate max-w-[120px]">
                          {Artisan.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge-active">{Artisan.category}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {Artisan.address}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full
                        ${Artisan.status === "approved"  ? "badge-active" :
                          Artisan.status === "pending"   ? "badge-pending" :
                          Artisan.status === "suspended" ? "badge-suspended" :
                          "bg-gray-100 dark:bg-gray-700 text-gray-500 text-2xs font-semibold px-2.5 py-0.5 rounded-full"}`}>
                        {Artisan.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(Artisan.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
