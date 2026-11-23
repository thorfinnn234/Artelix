import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { getAdminReports, reportCategoryLabel, updateReport } from "../../services/reportService";

const statuses = ["", "open", "reviewing", "resolved", "dismissed"];
const kinds = [{ value: "", label: "Everything" }, { value: "misconduct", label: "Misconduct reports" }, { value: "support", label: "Support requests" }];
const statusClass = (status) => `booking-status status-${status === "resolved" ? "completed" : status === "dismissed" ? "cancelled" : status === "reviewing" ? "in_progress" : "requested"}`;

export default function AdminReported() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("open");
  const [kind, setKind] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true); setError("");
    getAdminReports({ status: filter || undefined, kind: kind || undefined })
      .then((data) => setReports(data.reports || []))
      .catch((err) => setError(err.response?.data?.message || "Unable to load reports."))
      .finally(() => setLoading(false));
  };
  useEffect(load, [filter, kind]);

  const resolve = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true); setModalError("");
    try {
      await updateReport(modal._id, { status: form.get("status"), resolutionNote: form.get("resolutionNote") });
      setModal(null);
      load();
    } catch (err) {
      setModalError(err.response?.data?.message || "Unable to update report.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="page-title">Reports & support</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Review misconduct reports and support requests, keep an audit trail, and send a clear response. Booking disputes are handled under <Link to="/admin/bookings?status=disputed" className="text-green-600 dark:text-green-400 font-semibold">Bookings & disputes</Link>.</p>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {kinds.map((item) => <button key={item.label} onClick={() => setKind(item.value)} className={`px-3 py-2 rounded-full text-xs font-semibold ${kind === item.value ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900" : "bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-500"}`}>{item.label}</button>)}
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => <button key={status || "all"} onClick={() => setFilter(status)} className={`px-3 py-2 rounded-full text-xs font-semibold capitalize ${filter === status ? "bg-green-500 text-white" : "bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-500"}`}>{status || "All statuses"}</button>)}
        </div>
      </div>

      {error && <p role="alert" className="booking-error">{error}</p>}
      {loading ? <div className="card" role="status">Loading reports…</div> : reports.length === 0 ? (
        <div className="card text-center py-16"><h2 className="font-heading font-semibold">Nothing here</h2><p className="text-sm text-gray-400 mt-1">Customer reports and support requests will appear here for review.</p></div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <article className="card" key={report._id}>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">
                    <span className={`font-semibold ${report.kind === "support" ? "text-blue-600 dark:text-blue-300" : "text-red-600 dark:text-red-400"}`}>{report.kind === "support" ? "Support" : "Misconduct"}</span>
                    {" · "}{report.reporterId?.fullName} ({report.reporterRole === "artisan" ? "artisan" : "customer"}) · {report.reporterId?.email}
                  </p>
                  <h2 className="font-heading font-semibold mt-1 break-words">
                    {report.kind === "support" ? report.subject : <>{reportCategoryLabel(report)} · {report.artisanId?.name || "Deleted artisan"}</>}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {report.kind === "support" && <>{reportCategoryLabel(report)}</>}
                    {report.bookingId && <>{report.kind === "support" ? " · " : ""}Booking: <Link className="underline" to={`/admin/bookings?booking=${report.bookingId._id}`}>{report.bookingId.title}</Link> ({report.bookingId.status?.replaceAll("_", " ")})</>}
                    {report.kind !== "support" && report.artisanId && <>{report.bookingId ? " · " : ""}<Link className="underline" to={`/admin/artisan?search=${encodeURIComponent(report.artisanId.name)}`}>Moderate listing</Link></>}
                  </p>
                </div>
                <span className={`${statusClass(report.status)} self-start`}>{report.status}</span>
              </div>
              <p className="booking-prose mt-3 whitespace-pre-line break-words">{report.details}</p>
              {report.resolutionNote && <p className="text-sm bg-gray-50 dark:bg-dark-card rounded-lg p-3 mt-3"><strong>Response{report.resolvedBy?.fullName ? ` (${report.resolvedBy.fullName})` : ""}: </strong>{report.resolutionNote}</p>}
              <div className="flex justify-between items-center gap-3 mt-4">
                <span className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleString("en-NG")}</span>
                <button className="btn-outline text-xs" onClick={() => { setModal(report); setModalError(""); }}>Review</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <form onSubmit={resolve} className="bg-white dark:bg-dark-surface w-full max-w-md rounded-xl p-6">
            <h2 className="font-heading font-bold text-lg">Review {modal.kind === "support" ? "support request" : "report"}</h2>
            <p className="text-sm text-gray-500 mt-2">{modal.kind === "support" ? modal.subject : `${modal.artisanId?.name} · ${reportCategoryLabel(modal)}`}</p>
            <label className="block text-sm font-semibold mt-4">Status
              <select name="status" defaultValue={modal.status} className="input mt-1">
                <option value="open">Open</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option>
              </select>
            </label>
            <label className="block text-sm font-semibold mt-4">Response to {modal.reporterRole === "artisan" ? "artisan" : "customer"}
              <textarea name="resolutionNote" defaultValue={modal.resolutionNote} maxLength={4000} rows={4} className="input mt-1 resize-none" />
              <span className="block text-2xs font-normal text-gray-400 mt-1">Required (5+ characters) when resolving or dismissing. The reporter is notified of every update.</span>
            </label>
            {modalError && <p role="alert" className="booking-error mt-3">{modalError}</p>}
            <div className="flex gap-3 mt-5">
              <button type="button" className="btn-outline flex-1" onClick={() => setModal(null)}>Cancel</button>
              <button disabled={saving} className="btn-primary flex-1">{saving ? "Saving…" : "Save"}</button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
