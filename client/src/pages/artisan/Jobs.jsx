import { useState } from "react";
import ArtisanLayout from "../../layouts/ArtisanLayout";

const DUMMY_JOBS = [
  { id: 1, user: "Amara Okafor",  avatar: "Amara",  service: "Fix leaking pipe",       location: "Yaba, Lagos",    status: "pending",  time: "2 mins ago",  phone: "08012345678" },
  { id: 2, user: "Chukwu Emeka", avatar: "Chukwu", service: "Install ceiling fan",    location: "Ikeja, Lagos",   status: "accepted", time: "1 hour ago",  phone: "08087654321" },
  { id: 3, user: "Fatima Bello", avatar: "Fatima", service: "Full house wiring check", location: "Lekki, Lagos",   status: "pending",  time: "3 hours ago", phone: "08023456789" },
  { id: 4, user: "Tunde Adeleke",avatar: "Tunde",  service: "Fix generator noise",    location: "Surulere, Lagos",status: "done",     time: "1 day ago",   phone: "08034567890" },
  { id: 5, user: "Ngozi Eze",    avatar: "Ngozi",  service: "New socket installation", location: "Ajah, Lagos",    status: "rejected", time: "2 days ago",  phone: "08045678901" },
];

const FILTERS = ["all", "pending", "accepted", "done", "rejected"];

export default function ArtisanJobs() {
  const [filter, setFilter]   = useState("all");
  const [jobs, setJobs]       = useState(DUMMY_JOBS);

  const filtered = filter === "all"
    ? jobs
    : jobs.filter((j) => j.status === filter);

  const updateStatus = (id, status) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status } : j))
    );
  };

  const statusBadge = (status) => ({
    pending:  "badge-pending",
    accepted: "badge-active",
    done:     "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-2xs font-semibold px-2.5 py-0.5 rounded-full",
    rejected: "badge-suspended",
  }[status]);

  return (
    <ArtisanLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
          Job Requests
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Manage requests from users
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold 
                             capitalize transition-all duration-200
                             ${filter === f
                               ? "bg-green-500 text-white"
                               : "bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-dark-border hover:border-green-500 hover:text-green-500"
                             }`}>
            {f} {f === "all" ? `(${jobs.length})` : `(${jobs.filter(j => j.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-500/10 
                          flex items-center justify-center mb-4 text-3xl">
            📋
          </div>
          <h3 className="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-1">
            No {filter} jobs
          </h3>
          <p className="text-gray-400 text-sm">
            Job requests will appear here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((job) => (
            <div key={job.id} className="card">
              <div className="flex items-start gap-4">

                {/* Avatar */}
                <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${job.avatar}`}
                     alt={job.user}
                     className="w-12 h-12 rounded-full bg-green-50 border 
                                border-gray-100 dark:border-dark-border shrink-0" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-gray-900 
                                   dark:text-gray-100">
                        {job.user}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                        {job.service}
                      </p>
                    </div>
                    <span className={statusBadge(job.status)}>
                      {job.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {job.time}
                    </div>
                  </div>

                  {/* Actions */}
                  {job.status === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => updateStatus(job.id, "accepted")}
                              className="btn-primary text-xs px-4 py-2">
                        Accept
                      </button>
                      <button onClick={() => updateStatus(job.id, "rejected")}
                              className="btn-outline text-xs px-4 py-2 
                                         text-red-500 border-red-200 hover:bg-red-50">
                        Decline
                      </button>
                      <a href={`tel:${job.phone}`}
                         className="btn-ghost text-xs px-4 py-2 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call
                      </a>
                    </div>
                  )}

                  {job.status === "accepted" && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => updateStatus(job.id, "done")}
                              className="btn-primary text-xs px-4 py-2">
                        Mark as Done
                      </button>
                      <a href={`tel:${job.phone}`}
                         className="btn-ghost text-xs px-4 py-2 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call User
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ArtisanLayout>
  );
}