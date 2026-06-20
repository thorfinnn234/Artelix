import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import ThemeToggle from "../../components/ThemeToggle";
import HeroIllustration from "../../assets/undraw_reviews_ukai.svg";

export default function ForgotPassword() {
  const navigate              = useNavigate();
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess("A reset code has been sent to your email.");
      localStorage.setItem("reset-email", email);
      setEmail("");
      setTimeout(() => navigate("/reset-password"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT — Green Branding Panel */}
      <div className="hidden lg:flex w-1/2 bg-green-500 flex-col items-center 
                      justify-center px-12 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 
                        bg-green-600 rounded-full opacity-30" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 
                        bg-green-400 rounded-full opacity-20" />
        <div className="relative z-10 text-center mb-10">
          <h1 className="font-heading text-4xl font-bold text-white mb-2">
            Artelix
          </h1>
          <p className="text-green-100 text-base">
            Your trusted Artisan marketplace
          </p>
        </div>
        <div className="relative z-10 w-full max-w-sm">
          <img src={HeroIllustration} alt="Artelix"
               className="w-full" />
        </div>
      </div>

      {/* RIGHT — Form Panel */}
      <div className="w-full lg:w-1/2 bg-gray-50 dark:bg-dark-bg flex 
                      items-center justify-center px-6 py-10 relative">

        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <h1 className="font-heading text-3xl font-bold text-green-500">
              Artelix
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="font-heading text-2xl font-bold text-gray-900 
                           dark:text-gray-100">
              Forgot password? 🔑
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Enter your email and we'll send you a reset code.
            </p>
          </div>

          <div className="card">

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-xl bg-green-50 dark:bg-green-500/10 
                              flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none"
                     stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 
                           002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
                  {success} Redirecting...
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-600 
                                  dark:text-gray-400 mb-1.5 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="@example.com"
                  required
                  disabled={!!success}
                  className="input"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !!success}
                className="btn-primary w-full mt-2 disabled:opacity-60 
                           disabled:cursor-not-allowed"
              >
                {loading
                  ? "Sending code..."
                  : success
                  ? "Code Sent! Redirecting..."
                  : "Send Reset Code"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
              Remembered it?{" "}
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