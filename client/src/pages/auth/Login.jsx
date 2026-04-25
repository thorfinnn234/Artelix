import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/ThemeToggle";
import HeroIllustration from "../../assets/undraw_reviews_ukai.svg";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(form.email, form.password);
      login(data.user, data.token);
      if (data.user.role === "admin") navigate("/admin/dashboard");
      else if (data.user.role === "vendor") navigate("/vendor/dashboard");
      else navigate("/user/home");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT — Green Branding Panel */}
      <div
        className="hidden lg:flex w-1/2 bg-green-500 flex-col items-center 
                      justify-center px-12 relative overflow-hidden"
      >
        {/* Background circles */}
        <div
          className="absolute top-[-80px] left-[-80px] w-80 h-80 
                        bg-green-600 rounded-full opacity-30"
        />
        <div
          className="absolute bottom-[-60px] right-[-60px] w-64 h-64 
                        bg-green-400 rounded-full opacity-20"
        />

        {/* Logo */}
        <div className="relative z-10 text-center mb-10">
          <h1 className="font-heading text-4xl font-bold text-white mb-2">
            Vendorly
          </h1>
          <p className="text-green-100 text-base">
            Find trusted vendors near you
          </p>
        </div>

        {/* Illustration */}
        <div className="relative z-10 w-full max-w-sm mb-10">
          <img
            src={HeroIllustration}
            alt="Vendorly illustration"
            className="w-full drop-shadow-xl"
          />
        </div>

        {/* Stats */}
        <div className="relative z-10 flex gap-8">
          <div className="text-center">
            <p className="font-heading text-3xl font-bold text-white">1,254</p>
            <p className="text-green-100 text-xs mt-1">Registered Users</p>
          </div>
          <div className="w-px bg-green-400 opacity-50" />
          <div className="text-center">
            <p className="font-heading text-3xl font-bold text-white">99+</p>
            <p className="text-green-100 text-xs mt-1">Verified Vendors</p>
          </div>
          <div className="w-px bg-green-400 opacity-50" />
          <div className="text-center">
            <p className="font-heading text-3xl font-bold text-white">4.8★</p>
            <p className="text-green-100 text-xs mt-1">Avg. Rating</p>
          </div>
        </div>
      </div>

      {/* RIGHT — Form Panel */}
      <div
        className="w-full lg:w-1/2 bg-gray-50 dark:bg-dark-bg flex 
                      items-center justify-center px-6 py-10 relative"
      >
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          {/* Mobile logo — only shows on small screens */}
          <div className="text-center mb-8 lg:hidden">
            <h1 className="font-heading text-3xl font-bold text-green-500">
              Vendorly
            </h1>
          </div>

          <div className="mb-8">
            <h2
              className="font-heading text-2xl font-bold text-gray-900 
                           dark:text-gray-100"
            >
              Welcome back 👋
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Log in to your account to continue.
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div
                  className="bg-red-50 dark:bg-red-500/10 text-red-600 
                                dark:text-red-400 text-sm px-4 py-3 rounded-md"
                >
                  {error}
                </div>
              )}

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
                  placeholder="name@example.com"
                  required
                  className="input"
                />
              </div>

              <div>
                <label
                  className="text-xs font-semibold text-gray-600 
                                  dark:text-gray-400 mb-1.5 block"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Your password"
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 
                                 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 
                                 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 
                                 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 
                                 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 
                                 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-green-500 hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <hr className="flex-1 border-gray-200 dark:border-dark-border" />
                <span className="text-xs text-gray-400">or</span>
                <hr className="flex-1 border-gray-200 dark:border-dark-border" />
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={() =>
                  (window.location.href =
                    "http://localhost:5000/api/auth/google")
                }
                className="w-full flex items-center justify-center gap-3 border 
             border-gray-200 dark:border-dark-border rounded-md py-2.5 
             px-4 text-sm font-medium text-gray-700 dark:text-gray-300
             hover:bg-gray-100 dark:hover:bg-dark-card cursor-pointer 
             bg-white dark:bg-dark-surface transition-colors duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-60 
                                 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-green-500 font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
