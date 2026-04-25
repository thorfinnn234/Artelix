import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import NotificationDropdown from "../pages/user/Notifications";
import MessageDropdown from "../pages/user/Messages";

const navLinks = [
  {
    to: "/user/home",
    label: "Browse Vendors",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    to: "/user/saved",
    label: "Saved Vendors",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
  {
    to: "/user/profile",
    label: "My Profile",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
];

export default function UserLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-surface 
                         border-r border-gray-100 dark:border-dark-border flex flex-col
                         transform transition-transform duration-300 lg:translate-x-0
                         ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo only */}
        <div
          className="h-16 flex items-center px-6 border-b 
                        border-gray-100 dark:border-dark-border"
        >
          <h1 className="font-heading text-xl font-bold text-green-500">
            Vendorly
          </h1>
        </div>

        {/* Main Menu */}
        <div className="flex-1 m-2">
          <span className="text-xs  text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Main Menu
          </span>
          <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-dark-border">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-500 hover:bg-red-50 
                       dark:hover:bg-red-500/10 hover:text-red-600"
          >
            <svg
              className="w-5 h-5"
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
            Logout
          </button>
        </div>
      </aside>

      {/* Sidebar Overlay — mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top Header */}
        <header
          className="h-16 bg-white dark:bg-dark-surface border-b 
                           border-gray-100 dark:border-dark-border flex items-center 
                           justify-between px-4 lg:px-6 sticky top-0 z-30"
        >
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-500 
                       hover:bg-gray-100 dark:hover:bg-dark-card"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Empty left side on desktop */}
          <div className="hidden lg:block" />

          {/* Right side — theme toggle + user info */}
          <div className="flex items-center gap-2">
            <MessageDropdown />
            <NotificationDropdown />
            <ThemeToggle />

            {/* User info — name + avatar */}
            <div className="flex items-center gap-2.5">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-9 h-9 bg-center bg-slate-700 shadow-xl rounded-full shrink-0"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full bg-green-500 flex items-center 
                                justify-center text-white font-bold text-sm shrink-0"
                >
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-right">
                <p
                  className="text-sm font-semibold text-gray-900 
                               dark:text-gray-100 leading-tight"
                >
                  {user?.fullName}
                </p>
                <p className="text-2xs text-gray-400 capitalize">
                  {user?.role}
                </p>
              </div>

              {/* Avatar */}
            </div>
            <div className=""></div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
