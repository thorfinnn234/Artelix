import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CalendarDays, LifeBuoy, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import UserLayout from "../../layouts/UserLayout";
import ArtisanLayout from "../../layouts/ArtisanLayout";
import { createSupportRequest, getMyReports, reportCategoryLabel, supportLabels } from "../../services/reportService";
import { listBookings } from "../../services/bookingService";

const statusClass = (status) => `booking-status status-${status === "resolved" ? "completed" : status === "dismissed" ? "cancelled" : status === "reviewing" ? "in_progress" : "requested"}`;
const formatDate = (value) => new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });

export default function Support() {
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();
  const isArtisan = role === "artisan";
  const Layout = isArtisan ? ArtisanLayout : UserLayout;
  const bookingsPath = isArtisan ? "/artisan/jobs" : "/user/bookings";

  const [reports, setReports] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const load = () => {
    setLoading(true); setError("");
    getMyReports().then((data) => setReports(data.reports || []))
      .catch((err) => setError(err.response?.data?.message || "Unable to load your requests."))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
    // Bookings are optional context for a request, so a failure here is not shown.
    listBookings().then((data) => setBookings(data.bookings || [])).catch(() => {});
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSending(true); setFormError("");
    try {
      await createSupportRequest({
        category: form.get("category"),
        subject: form.get("subject"),
        details: form.get("details"),
        bookingId: form.get("bookingId") || undefined,
      });
      setFormOpen(false);
      setNotice("Your request has been sent. The Artelix team will reply here and notify you.");
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Unable to send your request.");
    } finally {
      setSending(false);
    }
  };

  const disputed = bookings.filter((booking) => booking.status === "disputed");

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="page-title">Help & support</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Report a problem, resolve a booking issue, or ask the Artelix team for help.</p>
      </div>

      {notice && <p role="status" className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-sm px-4 py-3 rounded-md mb-6">{notice}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <section className="card flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3"><CalendarDays size={20} aria-hidden="true" /></div>
          <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100">Problem with a booking?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-1">Open the booking and choose <strong>Report an issue</strong>. Work pauses, and an Artelix administrator reviews both sides and records a decision.</p>
          <Link to={bookingsPath} className="btn-outline mt-4 text-center">Go to my bookings</Link>
        </section>
        {!isArtisan && (
          <section className="card flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 mb-3"><ShieldAlert size={20} aria-hidden="true" /></div>
            <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100">Report misconduct</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-1">For safety concerns, fraud, or harassment, open the artisan's profile and choose <strong>Report this listing</strong>.</p>
            <Link to="/user/home" className="btn-outline mt-4 text-center">Find the artisan</Link>
          </section>
        )}
        <section className="card flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400 mb-3"><LifeBuoy size={20} aria-hidden="true" /></div>
          <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100">Contact support</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-1">Account access, payments, {isArtisan ? "your listing or a suspension" : "or anything else"}. We reply here and send you a notification.</p>
          <button type="button" className="btn-primary mt-4" onClick={() => { setFormOpen(true); setFormError(""); setNotice(""); }}>Contact support</button>
        </section>
      </div>

      {disputed.length > 0 && (
        <section className="card mb-8 border-amber-200 dark:border-amber-500/30">
          <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-3">Open booking disputes</h2>
          <ul className="flex flex-col gap-2">
            {disputed.map((booking) => (
              <li key={booking._id} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate">{booking.title}</span>
                <Link to={`${bookingsPath}?booking=${booking._id}`} className="text-green-600 dark:text-green-400 font-semibold whitespace-nowrap">View dispute</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-3">Your requests & reports</h2>
      {error && <p role="alert" className="booking-error">{error} <button className="underline" onClick={load}>Try again</button></p>}
      {loading ? <div className="card" role="status">Loading…</div> : reports.length === 0 ? (
        <div className="card max-w-2xl"><div className="flex items-start gap-4"><div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-dark-card flex items-center justify-center text-gray-400 shrink-0"><AlertTriangle size={20} aria-hidden="true" /></div><div><h3 className="font-heading font-semibold text-gray-900 dark:text-gray-100">Nothing here yet</h3><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Requests and reports you send will appear here with the team's response.</p></div></div></div>
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map((report) => (
            <article className="card" key={report._id}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">
                    {report.kind === "support" ? "Support request" : `Report · ${report.artisanId?.name || "Artisan no longer available"}`} · {reportCategoryLabel(report)}
                  </p>
                  <h3 className="font-heading font-semibold mt-1 break-words">{report.kind === "support" ? report.subject : reportCategoryLabel(report)}</h3>
                  {report.bookingId && <p className="text-xs text-gray-400 mt-1">Booking: {report.bookingId.title}</p>}
                </div>
                <span className={statusClass(report.status)}>{report.status}</span>
              </div>
              <p className="booking-prose mt-3 whitespace-pre-line break-words">{report.details}</p>
              <p className="text-xs text-gray-400 mt-3">Sent {formatDate(report.createdAt)}</p>
              {report.resolutionNote && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-dark-card rounded-lg">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Artelix response</p>
                  <p className="text-sm mt-1 whitespace-pre-line break-words">{report.resolutionNote}</p>
                  {report.resolvedAt && <p className="text-xs text-gray-400 mt-2">Updated {formatDate(report.resolvedAt)}</p>}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={(event) => event.target === event.currentTarget && setFormOpen(false)}>
          <form onSubmit={submit} className="bg-white dark:bg-dark-surface rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" aria-labelledby="support-title">
            <h2 id="support-title" className="font-heading text-xl font-bold">Contact support</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Tell us what happened. Include dates and names where you can.</p>
            {formError && <p role="alert" className="booking-error mt-3">{formError}</p>}
            <label className="block text-sm font-semibold mt-4">What do you need help with?
              <select name="category" required className="input mt-1" defaultValue="">
                <option value="" disabled>Choose a topic</option>
                {Object.entries(supportLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            {bookings.length > 0 && (
              <label className="block text-sm font-semibold mt-4">Related booking <span className="font-normal text-gray-400">(optional)</span>
                <select name="bookingId" className="input mt-1" defaultValue="">
                  <option value="">None</option>
                  {bookings.map((booking) => <option key={booking._id} value={booking._id}>{booking.title}</option>)}
                </select>
              </label>
            )}
            <label className="block text-sm font-semibold mt-4">Subject
              <input name="subject" required minLength={3} maxLength={120} className="input mt-1" />
            </label>
            <label className="block text-sm font-semibold mt-4">Details
              <textarea name="details" required minLength={15} maxLength={4000} rows={5} className="input mt-1 resize-none" />
            </label>
            <div className="flex gap-3 mt-5">
              <button type="button" className="btn-outline flex-1" onClick={() => setFormOpen(false)}>Cancel</button>
              <button className="btn-primary flex-1" disabled={sending}>{sending ? "Sending…" : "Send request"}</button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}
