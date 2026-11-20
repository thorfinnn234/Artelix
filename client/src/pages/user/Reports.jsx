import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import UserLayout from "../../layouts/UserLayout";
import { getMyReports } from "../../services/reportService";

const labels = { safety: "Safety concern", fraud: "Fraud or scam", harassment: "Harassment", poor_service: "Poor service", other: "Other" };

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => {
    setLoading(true); setError("");
    getMyReports().then((data) => setReports(data.reports || []))
      .catch((err) => setError(err.response?.data?.message || "Unable to load your reports."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  return <UserLayout>
    <div className="mb-6"><h1 className="page-title">Reports & safety</h1><p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Track concerns you submitted and the Artelix team's response.</p></div>
    {error && <p role="alert" className="booking-error">{error} <button className="underline" onClick={load}>Try again</button></p>}
    {loading ? <div className="card" role="status">Loading reports…</div> : reports.length === 0 ? <div className="card max-w-2xl"><div className="flex items-start gap-4"><div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0"><AlertTriangle size={20}/></div><div><h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100">No reports yet</h2><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">If a listing raises a safety concern, open the listing and choose Report this listing. Updates will appear here.</p></div></div></div> : <div className="flex flex-col gap-4">{reports.map((report) => <article className="card" key={report._id}><div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"><div><p className="text-xs text-gray-400">{report.artisanId?.name || "Artisan no longer available"} · {report.artisanId?.category}</p><h2 className="font-heading font-semibold mt-1">{labels[report.category]}</h2></div><span className={`booking-status status-${report.status === "resolved" ? "completed" : report.status === "dismissed" ? "cancelled" : "requested"}`}>{report.status}</span></div><p className="booking-prose mt-3">{report.details}</p><p className="text-xs text-gray-400 mt-3">Submitted {new Date(report.createdAt).toLocaleString("en-NG")}</p>{report.resolutionNote && <div className="mt-4 p-3 bg-gray-50 dark:bg-dark-card rounded-lg"><p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Artelix update</p><p className="text-sm mt-1">{report.resolutionNote}</p>{report.resolvedAt && <p className="text-xs text-gray-400 mt-2">Updated {new Date(report.resolvedAt).toLocaleString("en-NG")}</p>}</div>}</article>)}</div>}
  </UserLayout>;
}
