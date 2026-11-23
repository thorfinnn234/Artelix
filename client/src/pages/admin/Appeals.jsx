import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getAdminAppeals, resolveAppeal } from "../../services/adminService";

const FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "", label: "All" },
];
const badge = { pending: "badge-pending", accepted: "badge-active", rejected: "badge-suspended" };
const formatDate = (value) => value ? new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "";

export default function AdminAppeals() {
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], totalPages: 1, pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // { appeal, decision }
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  const load = useCallback(() => {
    setLoading(true); setError("");
    getAdminAppeals({ status, page, limit: 12 })
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || "Unable to load appeals."))
      .finally(() => setLoading(false));
  }, [status, page]);
  useEffect(load, [load]);

  const decide = async (event) => {
    event.preventDefault();
    setSaving(true); setModalError("");
    try {
      await resolveAppeal(modal.appeal._id, modal.decision, note.trim());
      setModal(null); setNote("");
      load();
    } catch (err) {
      setModalError(err.response?.data?.message || "Unable to resolve this appeal.");
      if (err.response?.status === 409) load();
    } finally {
      setSaving(false);
    }
  };

  const noteRequired = modal?.decision === "reject";

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="page-title">Artisan appeals</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {data.pendingCount} awaiting a decision. Accepting restores the listing; the artisan is notified either way.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((filter) => (
          <button key={filter.label} onClick={() => { setStatus(filter.value); setPage(1); }}
                  className={`px-3 py-2 rounded-full text-xs font-semibold ${status === filter.value ? "bg-green-500 text-white" : "bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-500"}`}>
            {filter.label}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="booking-error">{error} <button className="underline" onClick={load}>Try again</button></p>}

      {loading ? <div className="card" role="status">Loading appeals…</div> : data.items.length === 0 ? (
        <div className="card text-center py-16">
          <h2 className="font-heading font-semibold">No {status || ""} appeals</h2>
          <p className="text-sm text-gray-400 mt-1">Appeals from suspended or rejected artisans appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {data.items.map((appeal) => {
            const listing = appeal.ArtisanId;
            return (
              <article key={appeal._id} className="card">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">{appeal.ArtisanOwnerId?.fullName} · {appeal.ArtisanOwnerId?.email}</p>
                    <h2 className="font-heading font-semibold mt-1">{listing?.name || "Deleted listing"} <span className="text-xs font-normal text-gray-400">· {listing?.category}</span></h2>
                    <p className="text-xs text-gray-400 mt-1">Listing is currently <strong className="capitalize">{listing?.status}</strong> · submitted {formatDate(appeal.createdAt)}</p>
                  </div>
                  <span className={`${badge[appeal.status]} text-2xs capitalize self-start`}>{appeal.status}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div className="rounded-lg bg-gray-50 dark:bg-dark-card p-3">
                    <p className="text-2xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Original reason ({appeal.appealedStatus || "moderation"})</p>
                    <p className="text-sm break-words whitespace-pre-line">{appeal.appealedReason || "No reason recorded."}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-dark-card p-3">
                    <p className="text-2xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Artisan's appeal</p>
                    <p className="text-sm break-words whitespace-pre-line">{appeal.message}</p>
                  </div>
                </div>

                {appeal.status === "pending" ? (
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:justify-end">
                    <button className="btn-outline text-xs text-red-500 border-red-200" onClick={() => { setModal({ appeal, decision: "reject" }); setNote(""); setModalError(""); }}>Reject appeal</button>
                    <button className="btn-primary text-xs" onClick={() => { setModal({ appeal, decision: "accept" }); setNote(""); setModalError(""); }}>Accept & restore listing</button>
                  </div>
                ) : (
                  <p className="text-sm mt-4 bg-gray-50 dark:bg-dark-card rounded-lg p-3">
                    <strong>Decision{appeal.resolvedBy?.fullName ? ` by ${appeal.resolvedBy.fullName}` : ""}: </strong>
                    {appeal.adminNote || "No note."}
                    <span className="block text-2xs text-gray-400 mt-1">{formatDate(appeal.resolvedAt)}</span>
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button className="btn-outline text-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span className="text-sm text-gray-500">Page {page} of {data.totalPages}</span>
          <button className="btn-outline text-sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <form onSubmit={decide} className="bg-white dark:bg-dark-surface w-full max-w-md rounded-xl p-6">
            <h2 className="font-heading font-bold text-lg">{modal.decision === "accept" ? "Accept appeal" : "Reject appeal"}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {modal.decision === "accept"
                ? `${modal.appeal.ArtisanId?.name} will be approved and visible to customers again.`
                : `${modal.appeal.ArtisanId?.name} stays ${modal.appeal.ArtisanId?.status}. The artisan will see your explanation.`}
            </p>
            <label className="block text-sm font-semibold mt-4">
              Note to the artisan {noteRequired ? "" : <span className="font-normal text-gray-400">(optional)</span>}
              <textarea value={note} onChange={(e) => setNote(e.target.value)} required={noteRequired} minLength={noteRequired ? 5 : undefined} maxLength={2000} rows={4} className="input mt-1 resize-none" />
            </label>
            {modalError && <p role="alert" className="booking-error mt-3">{modalError}</p>}
            <div className="flex gap-3 mt-5">
              <button type="button" className="btn-outline flex-1" onClick={() => setModal(null)}>Cancel</button>
              <button disabled={saving || (noteRequired && note.trim().length < 5)} className={`flex-1 py-2.5 rounded-md text-sm font-semibold text-white disabled:opacity-60 ${modal.decision === "accept" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}>
                {saving ? "Saving…" : modal.decision === "accept" ? "Accept appeal" : "Reject appeal"}
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
