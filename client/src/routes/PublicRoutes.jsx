import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoutes({ children }) {
  const { user, loading } = useAuth();
  const location          = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent 
                        rounded-full animate-spin" />
      </div>
    );
  }

  // Only redirect away from login/register if already logged in
  const authPaths = [
    "/login",
    "/register",
    "/register/form",
    "/forgot-password",
    "/reset-password",
  ];

  if (user && authPaths.includes(location.pathname)) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "Artisan") return <Navigate to="/artisan/dashboard" replace />;
    return <Navigate to="/user/home" replace />;
  }

  return children;
}