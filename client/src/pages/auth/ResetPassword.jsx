import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import ThemeToggle from "../../components/ThemeToggle";
import HeroIllustration from "../../assets/undraw_reviews_ukai.svg";

export default function ResetPassword() {
  const navigate              = useNavigate();
  const resetEmail            = localStorage.getItem("reset-email");
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    code:            "",
    newPassword:     "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (form.newPassword.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (!resetEmail) {
      return setError("Session expired. Please request a new code.");
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", {
        email:       resetEmail,
        code:        form.code,
        newPassword: form.newPassword,
      });
      setSuccess("Password reset successful!");
      localStorage.removeItem("reset-email");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Code is invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT — Green Branding Panel */}
      <div className="hidden lg:flex w-1/2 min-h-screen bg-green-500 flex-col 
                      items-center justify-center px-12 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 
                        bg-green-600 rounded-full opacity-30" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 
                        bg-green-400 rounded-full opacity-20" />
        <div className="relative z-10 text-center mb-10">
          <h1 className="font-heading text-4xl font-bold text-white mb-2">
            Vendorly
          </h1>
          <p className="text-green-100 text-base">
            Your trusted vendor marketplace
          </p>
        </div>
        <div className="relative z-10 w-full max-w-sm">
          <img src={HeroIllustration} alt="Vendorly"
               className="w-full drop-shadow-xl" />
        </div>
      </div>

      {/* RIGHT — Form Panel */}
      <div className="w-full lg:w-1/2 bg-gray-50 dark:bg-dark-bg flex 
                      items-center justify-center px-6 py-10 relative">

        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <h1 className="font-heading text-3xl font-bold text-green-500">
              Vendorly
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="font-heading text-2xl font-bold text-gray-900 
                           dark:text-gray-100">
              Reset password 🔒
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Enter the 6-digit code from your email and your new password.
            </p>
          </div>

          <div className="card">

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-xl bg-green-50 dark:bg-green-500/10 
                              flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none"
                     stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 
                           00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 text-red-600 
                                dark:text-red-400 text-sm px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-500/10 text-green-600 
                                dark:text-green-400 text-sm px-4 py-3 rounded-md 
                                flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none"
                       stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M5 13l4 4L19 7" />
                  </svg>
                  {success} Redirecting to login...
                </div>
              )}

              {/* Reset Code */}
              <div>
                <label className="text-xs font-semibold text-gray-600 
                                  dark:text-gray-400 mb-1.5 block">
                  Reset Code
                </label>
                <input
                  name="code"
                  type="text"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  className="input tracking-widest text-center text-lg font-semibold"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="text-xs font-semibold text-gray-600 
                                  dark:text-gray-400 mb-1.5 block">
                  New Password
                </label>
                <div className="relative">
                  <input
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    required
                    className="input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 
                               text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 
                                 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 
                                 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 
                                 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 
                                 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 
                                 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-semibold text-gray-600 
                                  dark:text-gray-400 mb-1.5 block">
                  Confirm Password
                </label>
                <input
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat new password"
                  required
                  className="input"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !!success}
                className="btn-primary w-full mt-2 disabled:opacity-60 
                           disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
              Didn't get a code?{" "}
              <Link to="/forgot-password"
                    className="text-green-500 font-semibold hover:underline">
                Resend
              </Link>
            </p>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              <Link to="/login"
                    className="text-green-500 font-semibold hover:underline">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}