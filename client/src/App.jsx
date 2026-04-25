import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import PublicRoutes    from "./routes/PublicRoutes";
import ProtectedRoute  from "./routes/ProtectedRoute";

import RoleSelect      from "./pages/auth/RoleSelect";
import Login           from "./pages/auth/Login";
import Register        from "./pages/auth/Register";
import ForgotPassword  from "./pages/auth/ForgotPassword";
import ResetPassword   from "./pages/auth/ResetPassword";
import GoogleSuccess   from "./pages/auth/GoogleSuccess";
import AvatarPicker    from "./pages/auth/AvatarPicker";

import Onboarding      from "./pages/Onboarding";

import UserHome        from "./pages/user/Home";
import VendorDetails   from "./pages/user/VendorDetails";
import SavedVendors    from "./pages/user/SavedVendors";
import UserProfile     from "./pages/user/Profile";
import Notifications   from "./pages/user/Notifications";
import Messages        from "./pages/user/Messages";

import VendorDashboard from "./pages/vendor/Dashboard";
import AdminDashboard  from "./pages/admin/Dashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root */}
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="/welcome" element={<Onboarding />} />

          {/* Auth */}
          <Route path="/register" element={<PublicRoutes><RoleSelect /></PublicRoutes>} />
          <Route path="/register/form" element={<PublicRoutes><Register /></PublicRoutes>} />
          <Route path="/login" element={<PublicRoutes><Login /></PublicRoutes>} />
          <Route path="/forgot-password" element={<PublicRoutes><ForgotPassword /></PublicRoutes>} />
          <Route path="/reset-password" element={<PublicRoutes><ResetPassword /></PublicRoutes>} />
          <Route path="/auth/google/success" element={<GoogleSuccess />} />
          <Route path="/pick-avatar" element={<AvatarPicker />} />

          {/* User */}
          <Route path="/user/home" element={
            <ProtectedRoute role="user"><UserHome /></ProtectedRoute>
          } />
          <Route path="/user/vendor/:id" element={
            <ProtectedRoute role="user"><VendorDetails /></ProtectedRoute>
          } />
          <Route path="/user/saved" element={
            <ProtectedRoute role="user"><SavedVendors /></ProtectedRoute>
          } />
          <Route path="/user/profile" element={
            <ProtectedRoute role="user"><UserProfile /></ProtectedRoute>
          } />
          <Route path="/user/notifications" element={
            <ProtectedRoute role="user"><Notifications /></ProtectedRoute>
          } />
          <Route path="/user/messages" element={
            <ProtectedRoute role="user"><Messages /></ProtectedRoute>
          } />

          {/* Vendor */}
          <Route path="/vendor/dashboard" element={
            <ProtectedRoute role="vendor"><VendorDashboard /></ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />

          {/* Catch all — must be last */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}