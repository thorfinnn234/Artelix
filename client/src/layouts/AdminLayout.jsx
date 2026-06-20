import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

const navLinks = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: "/admin/artisan",
    label: "Artisan",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    to: "/admin/approvals",
    label: "Approvals",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    badge: "pending",
  },
  {
    to: "/admin/users",
    label: "Users",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    to: "/admin/reported",
    label: "Reported",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    to: "/admin/settings",
    label: "Settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.fullName}
               className="w-9 h-9 rounded-full border-2 border-green-500 shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-green-500 flex items-center 
                          justify-center text-white font-bold text-sm shrink-0">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
            {user?.fullName}
          </p>
          <p className="text-2xs text-gray-400 capitalize">{user?.role}</p>
        </div>
        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-48 max-w-[calc(100vw-1rem)] bg-white dark:bg-dark-surface 
                        border border-gray-100 dark:border-dark-border rounded-2xl z-50 overflow-hidden">
          <Link to="/admin/settings" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 
                           dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-card 
                           hover:text-green-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
          <div className="border-t border-gray-100 dark:border-dark-border mx-3" />
          <button onClick={() => { setOpen(false); onLogout(); }}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 
                             hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminLayout({ children, pendingCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex min-w-0">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-surface 
                         border-r border-gray-100 dark:border-dark-border flex flex-col
                         transform transition-transform duration-300 lg:translate-x-0
                         ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>

        <div className="h-16 flex items-center px-6 border-b 
                        border-gray-100 dark:border-dark-border">
          <h1 className="font-heading text-xl font-bold text-green-500">Artelix</h1>
          <span className="ml-2 text-2xs bg-red-50 dark:bg-red-500/10 
                           text-red-600 dark:text-red-400 font-semibold 
                           px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>

        <div className="flex-1 px-3 py-4">
          <span className="text-xs text-gray-400 uppercase tracking-wider px-3 mb-2 block">
            Main Menu
          </span>
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to}
                       onClick={() => setSidebarOpen(false)}
                       className={({ isActive }) =>
                         `sidebar-link ${isActive ? "active" : ""}`
                       }>
                {link.icon}
                <span className="flex-1">{link.label}</span>
                {link.badge === "pending" && pendingCount > 0 && (
                  <span className="bg-amber-500 text-white text-2xs font-bold 
                                   px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="px-3 py-4 border-t border-gray-100 dark:border-dark-border">
          <button onClick={handleLogout}
                  className="sidebar-link w-full text-red-500 hover:bg-red-50 
                             dark:hover:bg-red-500/10 hover:text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden"
             onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <header className="h-16 bg-white dark:bg-dark-surface border-b 
                           border-gray-100 dark:border-dark-border flex items-center 
                           justify-between gap-3 px-3 sm:px-4 lg:px-6 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-500 
                             hover:bg-gray-100 dark:hover:bg-dark-card">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2 min-w-0">
            <ThemeToggle />
            <div className="ml-2">
              <ProfileDropdown user={user} onLogout={handleLogout} />
            </div>
          </div>
        </header>
        <main className="flex-1 min-w-0 p-3 sm:p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
