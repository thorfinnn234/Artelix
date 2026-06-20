import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import PublicRoutes from "./routes/PublicRoutes";
import ProtectedRoute from "./routes/ProtectedRoute";

import RoleSelect from "./pages/auth/RoleSelect";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import GoogleSuccess from "./pages/auth/GoogleSuccess";
import AvatarPicker from "./pages/auth/AvatarPicker";

import Onboarding from "./pages/Onboarding";

import UserHome from "./pages/user/Home";
import ArtisanDetails from "./pages/user/ArtisanDetails";
import SavedArtisan from "./pages/user/SavedArtisan";
import UserProfile from "./pages/user/Profile";
import UserMessages from "./pages/user/Messages";
import UserNotifications from "./pages/user/Notifications";
import UserReports from "./pages/user/Reports";
import UserSettings from "./pages/user/Settings";

import ArtisanDashboard from "./pages/artisan/Dashboard";
import ArtisanProfile from "./pages/artisan/Profile";
import ArtisanJobs from "./pages/artisan/Jobs";
import ArtisanMessages from "./pages/artisan/Messages";
import ArtisanNotifications from "./pages/artisan/Notifications";
import ArtisanListing from "./pages/artisan/Listing";
import ArtisanWorks from "./pages/artisan/Works";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminArtisan from "./pages/admin/Artisan";
import AdminApprovals from "./pages/admin/Approvals";
import AdminUsers from "./pages/admin/Users";
import AdminReported from "./pages/admin/Reported";
import AdminSettings from "./pages/admin/Settings";

// Auth-aware routes component
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent 
                        rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Root redirect based on auth status */}
      <Route path="/" element={
        user ? (
          String(user.role || "").toLowerCase() === "admin" ? <Navigate to="/admin/dashboard" replace /> :
          String(user.role || "").toLowerCase() === "artisan" ? <Navigate to="/artisan/dashboard" replace /> :
          <Navigate to="/user/home" replace />
        ) : (
          <Navigate to="/welcome" replace />
        )
      } />

      {/* Public onboarding page */}
      <Route path="/welcome" element={<Onboarding />} />

          <Route
            path="/register"
            element={
              <PublicRoutes>
                <RoleSelect />
              </PublicRoutes>
            }
          />

          <Route
            path="/register/form"
            element={
              <PublicRoutes>
                <Register />
              </PublicRoutes>
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoutes>
                <Login />
              </PublicRoutes>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <PublicRoutes>
                <ForgotPassword />
              </PublicRoutes>
            }
          />

          <Route
            path="/reset-password"
            element={
              <PublicRoutes>
                <ResetPassword />
              </PublicRoutes>
            }
          />

          <Route path="/auth/google/success" element={<GoogleSuccess />} />

          <Route
            path="/pick-avatar"
            element={
              <ProtectedRoute>
                <AvatarPicker />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/home"
            element={
              <ProtectedRoute role="user">
                <UserHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/artisan/:id"
            element={
              <ProtectedRoute role="user">
                <ArtisanDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/saved"
            element={
              <ProtectedRoute role="user">
                <SavedArtisan />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/profile"
            element={
              <ProtectedRoute role="user">
                <UserProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/messages"
            element={
              <ProtectedRoute role="user">
                <UserMessages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/notifications"
            element={
              <ProtectedRoute role="user">
                <UserNotifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/reports"
            element={
              <ProtectedRoute role="user">
                <UserReports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/settings"
            element={
              <ProtectedRoute role="user">
                <UserSettings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/artisan/dashboard"
            element={
              <ProtectedRoute role="artisan">
                <ArtisanDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/artisan/profile"
            element={
              <ProtectedRoute role="artisan">
                <ArtisanProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/artisan/jobs"
            element={
              <ProtectedRoute role="artisan">
                <ArtisanJobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/artisan/messages"
            element={
              <ProtectedRoute role="artisan">
                <ArtisanMessages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/artisan/notifications"
            element={
              <ProtectedRoute role="artisan">
                <ArtisanNotifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/artisan/listing"
            element={
              <ProtectedRoute role="artisan">
                <ArtisanListing />
              </ProtectedRoute>
            }
          />

          <Route
            path="/artisan/works"
            element={
              <ProtectedRoute role="artisan">
                <ArtisanWorks />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/artisan"
            element={
              <ProtectedRoute role="admin">
                <AdminArtisan />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/approvals"
            element={
              <ProtectedRoute role="admin">
                <AdminApprovals />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="admin">
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reported"
            element={
              <ProtectedRoute role="admin">
                <AdminReported />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute role="admin">
                <AdminSettings />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      );
    }

    export default function App() {
      return (
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      );
    }
