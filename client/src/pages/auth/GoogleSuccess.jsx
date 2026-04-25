import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function GoogleSuccess() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { login }      = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    console.log("Token received:", token ? "✅ Yes" : "❌ No");

    if (!token) {
      navigate("/login");
      return;
    }

    // Set token in localStorage first
    localStorage.setItem("Vendorly-token", token);

    // Then fetch user
    api.get("/me", {
      headers: { Authorization: `Bearer ${token}` } // ← pass token directly
    })
      .then((res) => {
        console.log("User data:", res.data);
        const userData = res.data.user;
        login(userData, token);
        if (userData.role === "admin")       navigate("/admin/dashboard");
        else if (userData.role === "vendor") navigate("/vendor/dashboard");
        else                                 navigate("/user/home");
      })
      .catch((err) => {
        console.error("Me error:", err.response?.data || err.message);
        localStorage.removeItem("Vendorly-token");
        navigate("/login?error=google_failed");
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center 
                    justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-green-500 border-t-transparent 
                        rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Signing you in with Google...
        </p>
      </div>
    </div>
  );
}