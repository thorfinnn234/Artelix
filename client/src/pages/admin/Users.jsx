import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getAdminUsers, deleteUser, suspendUser, unsuspendUser } from "../../services/adminService";

export default function AdminUsers() {
  const [users, setUsers]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [modal, setModal]       = useState(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getAdminUsers({ page, limit: 12, search });
        setUsers(data.items || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [page, search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers({ page, limit: 12, search });
      setUsers(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const handleAction = async (action, id) => {
    setActionLoading(id);
    try {
      if (action === "delete")    await deleteUser(id);
      if (action === "suspend")   await suspendUser(id);
      if (action === "unsuspend") await unsuspendUser(id);
      setModal(null);
      fetchUsers();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
          Manage Users
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {total} registered users
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm w-full">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
               placeholder="Search users..." className="input pl-10" />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full responsive-table">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border">
                {["User", "Email", "Status", "Joined", "Actions"].map((h) => (
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
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-dark-border rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No users found
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user._id}
                    className="border-b border-gray-50 dark:border-dark-border 
                               hover:bg-gray-50 dark:hover:bg-dark-card transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.fullName}
                             className="w-8 h-8 rounded-full border border-gray-100" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center 
                                        justify-center text-white text-xs font-bold shrink-0">
                          {user.fullName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-semibold text-gray-900 
                                       dark:text-gray-100 truncate max-w-[120px]">
                        {user.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 
                                 max-w-[160px] truncate">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <span className={user.isSuspended ? "badge-suspended" : "badge-active"}>
                      {user.isSuspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {user.isSuspended ? (
                        <button onClick={() => handleAction("unsuspend", user._id)}
                                disabled={actionLoading === user._id}
                                className="text-xs bg-green-50 dark:bg-green-500/10 
                                           text-green-600 px-2.5 py-1.5 rounded-lg 
                                           font-semibold hover:opacity-80 disabled:opacity-40">
                          Unsuspend
                        </button>
                      ) : (
                        <button onClick={() => handleAction("suspend", user._id)}
                                disabled={actionLoading === user._id}
                                className="text-xs bg-amber-50 dark:bg-amber-500/10 
                                           text-amber-600 px-2.5 py-1.5 rounded-lg 
                                           font-semibold hover:opacity-80 disabled:opacity-40">
                          Suspend
                        </button>
                      )}
                      <button onClick={() => setModal(user)}
                              className="text-xs bg-red-50 dark:bg-red-500/10 
                                         text-red-600 px-2.5 py-1.5 rounded-lg 
                                         font-semibold hover:opacity-80">
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
          Showing {users.length} of {total} users
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-outline text-sm px-4 py-2 disabled:opacity-40">
            ← Prev
          </button>
          <span className="flex items-center px-4 text-sm text-gray-500">Page {page}</span>
          <button onClick={() => setPage((p) => p + 1)}
                  disabled={users.length < 12}
                  className="btn-outline text-sm px-4 py-2 disabled:opacity-40">
            Next →
          </button>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
             style={{ background: "rgba(0,0,0,0.5)" }}
             onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="bg-white dark:bg-dark-surface rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-heading font-bold text-gray-900 dark:text-gray-100 mb-2">
              Delete User
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{modal.fullName}"? This cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setModal(null)} className="btn-outline flex-1">
                Cancel
              </button>
              <button onClick={() => handleAction("delete", modal._id)}
                      disabled={actionLoading === modal._id}
                      className="flex-1 py-2.5 rounded-md text-sm font-semibold 
                                 text-white bg-red-500 hover:bg-red-600 
                                 disabled:opacity-60 transition-colors">
                {actionLoading === modal._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
