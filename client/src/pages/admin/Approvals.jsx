import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getAdminArtisan, approveArtisan, rejectArtisan } from "../../services/adminService";

export default function AdminApprovals() {
  const [Artisan, setArtisan]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [modal, setModal]       = useState(null);
  const [reason, setReason]     = useState("");

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await getAdminArtisan({ status: "pending", limit: 50 });
      setArtisan(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await approveArtisan(id);
      fetchPending();
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!modal) return;
    setActionLoading(modal._id);
    try {
      await rejectArtisan(modal._id, reason);
      setModal(null);
      setReason("");
      fetchPending();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout pendingCount={Artisan.length}>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
          Pending Approvals
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {Artisan.length} Artisan{Artisan.length !== 1 ? "s" : ""} waiting for review
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card">
              <div className="h-12 bg-gray-200 dark:bg-dark-border rounded mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-dark-border rounded mb-2 w-2/3" />
              <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : Artisan.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-500/10 
                          flex items-center justify-center mb-4 text-3xl">
            ✅
          </div>
          <h3 className="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-1">
            All caught up!
          </h3>
          <p className="text-gray-400 text-sm">No pending Artisan approvals</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Artisan.map((Artisan) => (
            <div key={Artisan._id}
                 className="card border-amber-200 dark:border-amber-500/20 transition-all duration-200">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-500/10 
                                flex items-center justify-center shrink-0">
                  <span className="font-bold text-lg text-green-500">
                    {Artisan.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-gray-900 
                                 dark:text-gray-100 truncate">
                    {Artisan.name}
                  </h3>
                  <span className="badge-pending text-2xs">{Artisan.status}</span>
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-col gap-1.5 mb-4">
                {[
                  { icon: "🏷️", value: Artisan.category },
                  { icon: "📍", value: Artisan.address },
                  { icon: "📞", value: Artisan.phone },
                  { icon: "📅", value: new Date(Artisan.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) },
                ].map((item) => (
                  <div key={item.icon} className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{item.icon}</span>
                    <span className="truncate">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleApprove(Artisan._id)}
                  disabled={actionLoading === Artisan._id}
                  className="btn-primary flex-1 text-xs py-2.5 disabled:opacity-60">
                  {actionLoading === Artisan._id ? "..." : "✓ Approve"}
                </button>
                <button
                  onClick={() => setModal(Artisan)}
                  className="btn-outline flex-1 text-xs py-2.5 text-red-500 
                             border-red-200 hover:bg-red-50 dark:hover:bg-red-500/10">
                  ✕ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
             style={{ background: "rgba(0,0,0,0.5)" }}
             onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="bg-white dark:bg-dark-surface rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-heading font-bold text-gray-900 dark:text-gray-100 mb-2">
              Reject Artisan
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Provide a reason for rejecting "{modal.name}"
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
              className="input resize-none mb-4"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => { setModal(null); setReason(""); }}
                      className="btn-outline flex-1">Cancel</button>
              <button onClick={handleReject}
                      disabled={actionLoading === modal._id}
                      className="flex-1 py-2.5 rounded-md text-sm font-semibold 
                                 text-white bg-red-500 hover:bg-red-600 
                                 disabled:opacity-60 transition-colors">
                {actionLoading === modal._id ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
