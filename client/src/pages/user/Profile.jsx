import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Edit3,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import UserLayout from "../../layouts/UserLayout";
import api from "../../services/api";

const defaultPreferences = {
  emailUpdates: true,
  bookingMessages: true,
  savedArtisanUpdates: true,
  promotions: false,
};

const preferenceLabels = {
  emailUpdates: "Email updates",
  bookingMessages: "Booking messages",
  savedArtisanUpdates: "Saved artisan updates",
  promotions: "Promotions",
};

function formatDate(value) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getLocationText(location) {
  const parts = [location?.area, location?.city, location?.state].filter(Boolean);
  return parts.length ? parts.join(", ") : "Not added";
}

export default function UserProfile() {
  const { user, login, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    location: { area: "", city: "", state: "" },
    notificationPreferences: defaultPreferences,
  });

  useEffect(() => {
    setForm({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      location: {
        area: user?.location?.area || "",
        city: user?.location?.city || "",
        state: user?.location?.state || "",
      },
      notificationPreferences: {
        ...defaultPreferences,
        ...(user?.notificationPreferences || {}),
      },
    });
  }, [user]);

  const completion = useMemo(() => {
    const checks = [
      Boolean(user?.avatar),
      Boolean(user?.fullName),
      Boolean(user?.email),
      Boolean(user?.phone),
      Boolean(user?.location?.city || user?.location?.state || user?.location?.area),
      Boolean(user?.emailVerified),
    ];
    const complete = checks.filter(Boolean).length;
    return Math.round((complete / checks.length) * 100);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      location: { ...current.location, [name]: value },
    }));
    setError("");
    setSuccess("");
  };

  const handlePreferenceChange = (key) => {
    setForm((current) => ({
      ...current,
      notificationPreferences: {
        ...current.notificationPreferences,
        [key]: !current.notificationPreferences[key],
      },
    }));
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setEditing(false);
    setError("");
    setSuccess("");
    setForm({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      location: {
        area: user?.location?.area || "",
        city: user?.location?.city || "",
        state: user?.location?.state || "",
      },
      notificationPreferences: {
        ...defaultPreferences,
        ...(user?.notificationPreferences || {}),
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.patch("/me", form);
      login(res.data.user, localStorage.getItem("Artelix-token"));
      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const detailRows = [
    { label: "Full name", value: user?.fullName || "Not added", icon: UserCircle },
    { label: "Email", value: user?.email || "Not added", icon: Mail },
    { label: "Phone", value: user?.phone || "Not added", icon: Phone },
    { label: "Location", value: getLocationText(user?.location), icon: MapPin },
    { label: "Role", value: user?.role || "user", icon: ShieldCheck },
  ];

  const securityRows = [
    {
      label: "Email verification",
      value: user?.emailVerified ? "Verified" : "Not verified",
      icon: user?.emailVerified ? CheckCircle2 : XCircle,
    },
    {
      label: "Google account",
      value: user?.googleConnected ? "Connected" : "Not connected",
      icon: KeyRound,
    },
    {
      label: "Last login",
      value: formatDate(user?.lastLoginAt),
      icon: CalendarDays,
    },
  ];

  return (
    <UserLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
            My Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage your account details
          </p>
        </div>

        <div className="card mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-16 h-16 rounded-full bg-white border-2 border-green-500 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="font-heading font-bold text-gray-900 dark:text-gray-100">
                {user?.fullName}
              </h2>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="badge-active text-2xs inline-block capitalize">
                  {user?.role}
                </span>
                <span
                  className={`text-2xs px-2 py-1 rounded-full font-semibold ${
                    user?.isSuspended
                      ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                      : "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                  }`}
                >
                  {user?.isSuspended ? "Suspended" : "Active"}
                </span>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-40">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              <span>Profile completion</span>
              <span>{completion}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-dark-border overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-gray-900 dark:text-gray-100">
              Account Details
            </h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-ghost text-sm inline-flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>

          {success && (
            <div className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-sm px-4 py-3 rounded-md mb-4">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">
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
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="input"
                    placeholder="08012345678"
                    pattern="(?:\+234|234|0)[789][01][0-9\s-]{8,12}"
                    title="Enter a valid Nigerian phone number."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">
                  Email Address
                </label>
                <input value={user?.email || ""} className="input opacity-80" disabled />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">
                    Area
                  </label>
                  <input
                    name="area"
                    value={form.location.area}
                    onChange={handleLocationChange}
                    className="input"
                    placeholder="Lekki"
                    minLength={2}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">
                    City
                  </label>
                  <input
                    name="city"
                    value={form.location.city}
                    onChange={handleLocationChange}
                    className="input"
                    placeholder="Lagos"
                    minLength={2}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">
                    State
                  </label>
                  <input
                    name="state"
                    value={form.location.state}
                    onChange={handleLocationChange}
                    className="input"
                    placeholder="Lagos"
                    minLength={2}
                    required
                  />
                </div>
              </div>

              <div className="border border-gray-100 dark:border-dark-border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-4 h-4 text-green-500" />
                  <h4 className="font-heading font-semibold text-sm text-gray-900 dark:text-gray-100">
                    Notification Preferences
                  </h4>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.keys(preferenceLabels).map((key) => (
                    <label
                      key={key}
                      className="flex items-center justify-between gap-3 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span>{preferenceLabels[key]}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(form.notificationPreferences[key])}
                        onChange={() => handlePreferenceChange(key)}
                        className="w-4 h-4 accent-green-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={handleCancel} className="btn-outline flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid gap-3">
              {detailRows.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center sm:gap-4 py-2 border-b border-gray-100 dark:border-dark-border last:border-0"
                >
                  <span className="flex items-center gap-2 text-xs text-gray-400 font-medium uppercase tracking-wider">
                    <Icon className="w-4 h-4" />
                    {label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 sm:text-right capitalize break-words">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="card">
            <h3 className="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Account Security
            </h3>
            <div className="grid gap-3">
              {securityRows.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center sm:gap-4 py-2 border-b border-gray-100 dark:border-dark-border last:border-0"
                >
                  <span className="flex items-center gap-2 text-xs text-gray-400 font-medium uppercase tracking-wider">
                    <Icon className="w-4 h-4" />
                    {label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 sm:text-right break-words">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Activity
            </h3>
            <div className="grid gap-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center sm:gap-4 py-2 border-b border-gray-100 dark:border-dark-border">
                <span className="flex items-center gap-2 text-xs text-gray-400 font-medium uppercase tracking-wider">
                  <Bookmark className="w-4 h-4" />
                  Saved artisans
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {user?.savedArtisanCount ?? user?.savedArtisanIds?.length ?? 0}
                </span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center sm:gap-4 py-2">
                <span className="flex items-center gap-2 text-xs text-gray-400 font-medium uppercase tracking-wider">
                  <CalendarDays className="w-4 h-4" />
                  Member since
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatDate(user?.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-5 mt-4">
          <h3 className="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Avatar
          </h3>
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-16 h-16 rounded-full bg-white border-2 border-green-500 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-2xl shrink-0">
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

        <div className="card mt-4 border-red-100 dark:border-red-500/20">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-semibold text-red-500 border border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </div>
    </UserLayout>
  );
}
