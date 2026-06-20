import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dashboardPathForRole, normalizeRole } from "../utils/roleRoutes";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const userRole = normalizeRole(user.role);
  const requiredRole = role ? normalizeRole(role) : null;

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={dashboardPathForRole(userRole)} replace />;
  }

  return children;
}