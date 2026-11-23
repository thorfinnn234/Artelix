import { useCallback, useEffect, useState } from "react";
import { Scale } from "lucide-react";
import { getMyAppeals, submitAppeal } from "../services/artisanService";

const appealBadge = {
  pending: "badge-pending",
  accepted: "badge-active",
  rejected: "badge-suspended",
};
const formatDate = (value) => value ? new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "";

// Shows a rejected or suspended artisan why, lets them appeal, and tracks the outcome.
// Renders nothing for listings in good standing with no appeal history.
export default function AppealPanel({ onStatusChange }) {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(() => {
    getMyAppeals()
      .then((result) => { setData(result); onStatusChange?.(result.listing?.status); })
      .catch(() => setData(null));
  }, [onStatusChange]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (data && window.location.hash === "#appeal") {
      document.getElementById("appeal")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [data]);

  if (!data) return null;
  const { listing, appeals, canAppeal } = data;
  const restricted = ["suspended", "rejected"].includes(listing.status);
  if (!restricted && appeals.length === 0) return null;

  const submit = async (event) => {
    event.preventDefault();
    setSending(true); setError("");
    try {
      await submitAppeal(message.trim());
      setMessage("");
      setNotice("Appeal submitted. You will be notified when an administrator makes a decision.");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit your appeal.");
    } finally {
      setSending(false);
    }
  };

  const pending = appeals.find((appeal) => appeal.status === "pending");

  return (
    <section id="appeal" className="card mb-6 scroll-mt-24" aria-labelledby="appeal-title">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0"><Scale size={20} aria-hidden="true" /></div>
        <div className="min-w-0 flex-1">
          <h2 id="appeal-title" className="font-heading font-semibold text-gray-900 dark:text-gray-100">
            {restricted ? `Your listing is ${listing.status}` : "Appeal history"}
          </h2>
          {restricted && (
            <div className="mt-2 rounded-lg bg-gray-50 dark:bg-dark-card p-3 text-sm">
              <p className="text-2xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Reason from Artelix</p>
              <p className="break-words whitespace-pre-line text-gray-700 dark:text-gray-200">{listing.moderationReason || "No reason was recorded. Contact support for details."}</p>
            </div>
          )}

          {notice && <p role="status" className="text-sm text-green-600 dark:text-green-400 mt-3">{notice}</p>}

          {pending && (
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-3">Your appeal from {formatDate(pending.createdAt)} is under review. We will notify you of the decision.</p>
          )}

          {canAppeal && (
            <form onSubmit={submit} className="mt-4">
              <label htmlFor="appeal-message" className="block text-sm font-semibold text-gray-900 dark:text-gray-100">Submit an appeal</label>
              <p className="text-xs text-gray-400 mt-1">Explain why the decision should be reviewed, and what you've changed if anything. Be specific.</p>
              <textarea id="appeal-message" value={message} onChange={(e) => setMessage(e.target.value)} minLength={20} maxLength={2000} rows={4} required className="input mt-2 resize-none" />
              <div className="flex items-center justify-between gap-3 mt-2">
                <span className="text-2xs text-gray-400">{message.trim().length}/2000 (minimum 20)</span>
                <button className="btn-primary" disabled={sending || message.trim().length < 20}>{sending ? "Submitting…" : "Submit appeal"}</button>
              </div>
              {error && <p role="alert" className="booking-error mt-2">{error}</p>}
            </form>
          )}

          {appeals.length > 0 && (
            <ol className="mt-5 flex flex-col gap-3">
              {appeals.map((appeal) => (
                <li key={appeal._id} className="border border-gray-100 dark:border-dark-border rounded-lg p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-gray-400">Appealed {appeal.appealedStatus || "decision"} · {formatDate(appeal.createdAt)}</span>
                    <span className={`${appealBadge[appeal.status]} text-2xs capitalize`}>{appeal.status}</span>
                  </div>
                  <p className="text-sm mt-2 break-words whitespace-pre-line">{appeal.message}</p>
                  {appeal.status !== "pending" && (
                    <div className="mt-2 text-sm bg-gray-50 dark:bg-dark-card rounded-md p-2">
                      <span className="font-semibold">Decision: </span>
                      {appeal.adminNote || (appeal.status === "accepted" ? "Your listing was restored." : "No note provided.")}
                      <span className="block text-2xs text-gray-400 mt-1">{formatDate(appeal.resolvedAt)}</span>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
