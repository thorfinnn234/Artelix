import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import UserLayout from "../../layouts/UserLayout";
import api from "../../services/api";

export default function UserProfile() {
  const { user, login, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.patch("/me", form);
      login(res.data.user, localStorage.getItem("Vendorly-token"));
      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1
            className="font-heading text-2xl font-bold text-gray-900 
                         dark:text-gray-100"
          >
            My Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage your account details
          </p>
        </div>
        {/* Avatar Card */}
        <div className="card mb-4 flex items-center gap-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.fullName}
              className="w-16 h-16 rounded-full bg-white border-2 
               border-green-500 shrink-0"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full bg-green-500 flex items-center 
                  justify-center text-white font-bold text-2xl shrink-0"
            >
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="font-heading font-bold text-gray-900 dark:text-gray-100">
              {user?.fullName}
            </h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <span className="badge-active text-2xs mt-1 inline-block capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="font-heading font-semibold text-gray-900 
                           dark:text-gray-100"
            >
              Account Details
            </h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-ghost text-sm"
              >
                Edit
              </button>
            )}
          </div>

          {success && (
            <div
              className="bg-green-50 dark:bg-green-500/10 text-green-600 
                            dark:text-green-400 text-sm px-4 py-3 rounded-md mb-4"
            >
              {success}
            </div>
          )}

          {error && (
            <div
              className="bg-red-50 dark:bg-red-500/10 text-red-600 
                            dark:text-red-400 text-sm px-4 py-3 rounded-md mb-4"
            >
              {error}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  className="text-xs font-semibold text-gray-600 
                                  dark:text-gray-400 mb-1.5 block"
                >
                  Full Name
                </label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label
                  className="text-xs font-semibold text-gray-600 
                                  dark:text-gray-400 mb-1.5 block"
                >
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-3">
              {[
                { label: "Full Name", value: user?.fullName },
                { label: "Email", value: user?.email },
                { label: "Role", value: user?.role },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center py-2 
                                border-b border-gray-100 dark:border-dark-border 
                                last:border-0"
                >
                  <span
                    className="text-xs text-gray-400 font-medium uppercase 
                                   tracking-wider"
                  >
                    {item.label}
                  </span>
                  <span
                    className="text-sm font-semibold text-gray-900 
                                   dark:text-gray-100 capitalize"
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card mb-5 mt-5">
          <h3
            className="font-heading font-semibold text-gray-900 
                 dark:text-gray-100 mb-4"
          >
            Avatar
          </h3>

          <div className="flex items-center gap-4 ">
            {/* Current Avatar */}
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-16 h-16 rounded-full bg-white border-2 
               border-green-500 shrink-0"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full bg-green-500 flex items-center 
                  justify-center text-white font-bold text-2xl shrink-0"
              >
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {user?.avatar ? "Looking good!" : "No avatar set"}
              </p>
              <p className="text-xs text-gray-400 mb-3">
                Pick from our avatar collection
              </p>
              <a href="/pick-avatar" className="btn-ghost text-sm">
                Change Avatar
              </a>
            </div>
          </div>
        </div>
        {/* Danger Zone */}
        <div className="card mt-4 border-red-100 dark:border-red-500/20">
         
          <button
            onClick={() => {
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 
                       rounded-md text-sm font-semibold text-red-500 border 
                       border-red-200 dark:border-red-500/30 hover:bg-red-50 
                       dark:hover:bg-red-500/10 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Log Out
          </button>
        </div>
      </div>
    </UserLayout>
  );
}
