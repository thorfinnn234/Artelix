import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getAdminArtisan, approveArtisan, rejectArtisan,
  suspendArtisan, unsuspendArtisan, deleteArtisan, reviewArtisanVerification,
} from "../../services/adminService";

const STATUS_FILTERS = ["all", "approved", "pending", "suspended", "rejected"];
// These decisions are sent to the artisan, so they must always explain why.
const REASON_REQUIRED = ["reject", "suspend", "verification-reject"];

export default function AdminArtisan() {
  const [params] = useSearchParams();
  const [Artisan, setArtisan]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState(() => params.get("search") || "");
  const [actionError, setActionError] = useState("");
  const [status, setStatus]     = useState("all");
  const [page, setPage]         = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [modal, setModal]       = useState(null);
  const [reason, setReason]     = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12, search };
        if (status !== "all") params.status = status;
        const data = await getAdminArtisan(params);
        setArtisan(data.items || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [page, search, status]);

  const fetchArtisan = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, search };
      if (status !== "all") params.status = status;
      const data = await getAdminArtisan(params);
      setArtisan(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  const handleAction = async (action, id, reasonText = "") => {
    setActionLoading(id);
    setActionError("");
    try {
      if (action === "approve")   await approveArtisan(id);
      if (action === "reject")    await rejectArtisan(id, reasonText);
      if (action === "suspend")   await suspendArtisan(id, reasonText);
      if (action === "unsuspend") await unsuspendArtisan(id);
      if (action === "delete")    await deleteArtisan(id);
      if (action === "verify") await reviewArtisanVerification(id, "verified");
      if (action === "verification-reject") await reviewArtisanVerification(id, "rejected", reasonText);
      setModal(null);
      setReason("");
      fetchArtisan();
    } catch (err) {
      setActionError(err.response?.data?.message || "That action could not be completed.");
    } finally {
      setActionLoading(null);
    }
  };
  const reasonMissing = modal && REASON_REQUIRED.includes(modal.type) && reason.trim().length < 5;

  return (
    <AdminLayout>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
          Manage Artisan
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {total} Artisan total
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                 placeholder="Search Artisan..." className="input pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button key={f} onClick={() => { setStatus(f); setPage(1); }}
                    className={`px-4 py-2 rounded-full text-xs font-semibold capitalize 
                               transition-all ${status === f
                                 ? "bg-green-500 text-white"
                                 : "bg-white dark:bg-dark-card text-gray-500 border border-gray-200 dark:border-dark-border hover:border-green-500 hover:text-green-500"
                               }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full responsive-table">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border">
                {["Artisan", "Category", "Phone", "Location", "Status", "Verification", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-2xs font-semibold 
                                         text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-dark-border rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : Artisan.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No Artisan found
                  </td>
                </tr>
              ) : Artisan.map((Artisan) => (
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
                    {Artisan.phone}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 
                                 max-w-[140px] truncate">
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
                  <td className="px-4 py-3">
                    <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full ${Artisan.verificationStatus === "verified" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300" : Artisan.verificationStatus === "pending" ? "badge-pending" : "bg-gray-100 dark:bg-dark-card text-gray-500 dark:text-gray-400"}`}>{Artisan.verificationStatus || "unverified"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {Artisan.status === "pending" && (
                        <>
                          <button onClick={() => handleAction("approve", Artisan._id)}
                                  disabled={actionLoading === Artisan._id}
                                  className="text-xs bg-green-50 dark:bg-green-500/10 
                                             text-green-600 dark:text-green-400 px-2.5 py-1.5 
                                             rounded-lg font-semibold hover:opacity-80 
                                             disabled:opacity-40 transition-opacity">
                            Approve
                          </button>
                          <button onClick={() => setModal({ type: "reject", Artisan })}
                                  className="text-xs bg-red-50 dark:bg-red-500/10 
                                             text-red-600 dark:text-red-400 px-2.5 py-1.5 
                                             rounded-lg font-semibold hover:opacity-80">
                            Reject
                          </button>
                        </>
                      )}
                      {Artisan.status === "approved" && (
                        <button onClick={() => setModal({ type: "suspend", Artisan })}
                                className="text-xs bg-amber-50 dark:bg-amber-500/10 
                                           text-amber-600 dark:text-amber-400 px-2.5 py-1.5 
                                           rounded-lg font-semibold hover:opacity-80">
                          Suspend
                        </button>
                      )}
                      {Artisan.status === "suspended" && (
                        <button onClick={() => handleAction("unsuspend", Artisan._id)}
                                disabled={actionLoading === Artisan._id}
                                className="text-xs bg-green-50 dark:bg-green-500/10 
                                           text-green-600 dark:text-green-400 px-2.5 py-1.5 
                                           rounded-lg font-semibold hover:opacity-80 
                                           disabled:opacity-40">
                          Unsuspend
                        </button>
                      )}
                      {Artisan.verificationStatus === "pending" && <><button onClick={() => setModal({ type: "verify", Artisan })} disabled={actionLoading === Artisan._id} className="text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 px-2.5 py-1.5 rounded-lg font-semibold disabled:opacity-40">Review verification</button><button onClick={() => setModal({ type: "verification-reject", Artisan })} className="text-xs bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-2.5 py-1.5 rounded-lg font-semibold">Reject verification</button></>}
                      <button onClick={() => setModal({ type: "delete", Artisan })}
                              className="text-xs bg-red-50 dark:bg-red-500/10 
                                         text-red-600 dark:text-red-400 px-2.5 py-1.5 
                                         rounded-lg font-semibold hover:opacity-80">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-400">
          Showing {Artisan.length} of {total} Artisan
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-outline text-sm px-4 py-2 disabled:opacity-40">
            ← Prev
          </button>
          <span className="flex items-center px-4 text-sm text-gray-500">
            Page {page}
          </span>
          <button onClick={() => setPage((p) => p + 1)}
                  disabled={Artisan.length < 12}
                  className="btn-outline text-sm px-4 py-2 disabled:opacity-40">
            Next →
          </button>
        </div>
      </div>

      {/* Action Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
             style={{ background: "rgba(0,0,0,0.5)" }}
             onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="bg-white dark:bg-dark-surface rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-heading font-bold text-gray-900 dark:text-gray-100 mb-2">
              {modal.type === "delete"  ? "Delete Artisan" :
               modal.type === "reject"  ? "Reject Artisan" :
               modal.type === "suspend" ? "Suspend Artisan" :
               modal.type === "verify" ? "Verify artisan listing" :
               modal.type === "verification-reject" ? "Reject verification" : ""}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {modal.type === "delete"
                ? `Are you sure you want to delete "${modal.Artisan.name}"? This cannot be undone.`
                : modal.type === "verify"
                  ? `Review ${modal.Artisan.name}'s qualification statement, then verify the listing if it meets Artelix standards.`
                : modal.type === "verification-reject"
                  ? `Explain what ${modal.Artisan.name} needs to provide for verification.`
                  : `Please provide a reason for ${modal.type}ing "${modal.Artisan.name}".`}
            </p>
            {(modal.type === "verify" || modal.type === "verification-reject") && modal.Artisan.verificationNote && (
              <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700 dark:border-dark-border dark:bg-dark-card dark:text-gray-200">
                <span className="mb-1 block text-2xs font-semibold uppercase tracking-wider text-gray-400">Qualification statement</span>
                {modal.Artisan.verificationNote}
              </div>
            )}
            {modal.type !== "delete" && modal.type !== "verify" && (
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`Reason for ${modal.type}...`}
                rows={3}
                maxLength={1000}
                aria-describedby="moderation-reason-help"
                className="input resize-none mb-1"
              />
            )}
            {REASON_REQUIRED.includes(modal.type) && (
              <p id="moderation-reason-help" className="text-2xs text-gray-400 mb-4">The artisan will see this reason in their notification and can appeal it.</p>
            )}
            {actionError && <p role="alert" className="booking-error mb-4">{actionError}</p>}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => { setModal(null); setReason(""); setActionError(""); }}
                      className="btn-outline flex-1">
                Cancel
              </button>
              <button
                onClick={() => handleAction(modal.type, modal.Artisan._id, reason.trim())}
                disabled={actionLoading === modal.Artisan._id || reasonMissing}
                className={`flex-1 py-2.5 rounded-md text-sm font-semibold text-white 
                           disabled:opacity-60 transition-colors
                           ${modal.type === "delete" || modal.type === "reject" || modal.type === "verification-reject"
                             ? "bg-red-500 hover:bg-red-600"
                             : "bg-amber-500 hover:bg-amber-600"}`}>
                {actionLoading === modal.Artisan._id ? "Processing..." :
                  modal.type === "delete"  ? "Delete" :
                  modal.type === "reject"  ? "Reject" :
                  modal.type === "verify" ? "Verify listing" :
                  modal.type === "verification-reject" ? "Reject verification" : "Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
