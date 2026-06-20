import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser } from "../services/authService";
import { getApiAuthUrl } from "../services/api";
import ThemeToggle from "../components/ThemeToggle";

function StaticSection({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

// Modal Component
function AuthModal({ mode, onClose, onSwitch }) {
  const navigate          = useNavigate();
  const { login }         = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole]   = useState("user");
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
    businessName: "", category: "", phone: "", address: "",
  });

  const isStrongPassword = (pwd) =>
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/.test(pwd);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(form.email, form.password);
      login(data.user, data.token);
      if (data.user.role === "admin")       navigate("/admin/dashboard");
      else if (data.user.role === "artisan") navigate("/artisan/dashboard");
      else                                  navigate("/user/home");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (!isStrongPassword(form.password)) return setError("Password must include letters, numbers and a symbol.");
    setError("");
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName,
        email:    form.email,
        password: form.password,
        role,
        ...(role === "Artisan" && {
          Artisan: {
            name:     form.businessName,
            category: form.category,
            phone:    form.phone,
            address:  form.address,
          },
        }),
      };
      const data = await registerUser(payload);
      login(data.user, data.token);
      navigate("/pick-avatar");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Plumber", "Electrician", "Carpenter", "Painter", "Cleaner",
    "Mechanic", "Barber", "Hair Stylist", "Tailor", "Web Developer",
    "Graphic Designer", "Photographer", "Caterer", "Other",
  ];

  const eyeOpen = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const eyeClosed = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white dark:bg-dark-surface rounded-2xl w-full max-w-md 
                   relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 
                     hover:bg-gray-100 dark:hover:bg-dark-card hover:text-gray-600 
                     transition-colors z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="font-heading text-2xl font-bold text-gray-900 
                           dark:text-gray-100">
              {mode === "login" ? "Welcome back 👋" : "Join Artelix 🎉"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {mode === "login"
                ? "Log in to your account to continue."
                : "Create your account today — it's free."}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-600 
                            dark:text-red-400 text-sm px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 
                                  dark:text-gray-400 mb-1.5 block">
                  Email Address
                </label>
                <input name="email" type="email" value={form.email}
                       onChange={handleChange} placeholder="john@example.com"
                       required className="input" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 
                                  dark:text-gray-400 mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <input name="password" type={showPassword ? "text" : "password"}
                         value={form.password} onChange={handleChange}
                         placeholder="Your password" required className="input pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 
                                     text-gray-400 hover:text-gray-600">
                    {showPassword ? eyeClosed : eyeOpen}
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <a href="/forgot-password"
                     className="text-xs text-green-500 hover:underline font-medium">
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Google */}
              <div className="flex items-center gap-3">
                <hr className="flex-1 border-gray-200 dark:border-dark-border" />
                <span className="text-xs text-gray-400">or</span>
                <hr className="flex-1 border-gray-200 dark:border-dark-border" />
              </div>
              <button type="button"
                      onClick={() => window.location.href = getApiAuthUrl("/google")}
                      className="w-full flex items-center justify-center gap-3 border 
                                 border-gray-200 dark:border-dark-border rounded-md py-2.5 
                                 text-sm font-medium text-gray-700 dark:text-gray-300
                                 hover:bg-gray-100 dark:hover:bg-dark-card bg-white 
                                 dark:bg-dark-surface transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <button type="submit" disabled={loading}
                      className="btn-primary w-full disabled:opacity-60">
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === "register" && (
            <>
              {/* Role Toggle */}
              <div className="flex bg-gray-100 dark:bg-dark-card rounded-lg p-1 mb-4">
                {["user", "Artisan"].map((r) => (
                  <button key={r} type="button" onClick={() => { setRole(r); setStep(1); }}
                          className={`flex-1 py-2 rounded-md text-sm font-semibold 
                                     transition-all duration-200 capitalize
                                     ${role === r
                                       ? "bg-white dark:bg-dark-surface text-green-500"
                                       : "text-gray-500 dark:text-gray-400"
                                     }`}>
                    {r === "user" ? "👤 User" : "🏢 Artisan"}
                  </button>
                ))}
              </div>

              {/* Step indicator for Artisan */}
              {role === "artisan" && (
                <div className="flex items-center gap-2 mb-4">
                  <div className={`flex items-center gap-1.5`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center 
                                    text-xs font-bold ${step >= 1 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                      1
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Account</span>
                  </div>
                  <div className={`flex-1 h-0.5 ${step >= 2 ? "bg-green-500" : "bg-gray-200"}`} />
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center 
                                    text-xs font-bold ${step >= 2 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                      2
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Business</span>
                  </div>
                </div>
              )}

              {/* Step 1 */}
              {step === 1 && (
                <form onSubmit={role === "Artisan" ? handleNextStep : handleRegister}
                      className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 
                                      dark:text-gray-400 mb-1.5 block">Full Name</label>
                    <input name="fullName" value={form.fullName} onChange={handleChange}
                           placeholder="John Doe" required className="input" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 
                                      dark:text-gray-400 mb-1.5 block">Email Address</label>
                    <input name="email" type="email" value={form.email}
                           onChange={handleChange} placeholder="john@example.com"
                           required className="input" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 
                                      dark:text-gray-400 mb-1.5 block">Password</label>
                    <div className="relative">
                      <input name="password" type={showPassword ? "text" : "password"}
                             value={form.password} onChange={handleChange}
                             placeholder="e.g. habeeb@1234" required className="input pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 
                                         text-gray-400 hover:text-gray-600">
                        {showPassword ? eyeClosed : eyeOpen}
                      </button>
                    </div>
                    <p className="text-2xs text-gray-400 mt-1">
                      Letters, numbers and a symbol — e.g. habeeb@1234
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 
                                      dark:text-gray-400 mb-1.5 block">Confirm Password</label>
                    <input name="confirmPassword" type={showPassword ? "text" : "password"}
                           value={form.confirmPassword} onChange={handleChange}
                           placeholder="Repeat password" required className="input" />
                  </div>

                  {/* Google */}
                  <div className="flex items-center gap-3">
                    <hr className="flex-1 border-gray-200 dark:border-dark-border" />
                    <span className="text-xs text-gray-400">or</span>
                    <hr className="flex-1 border-gray-200 dark:border-dark-border" />
                  </div>
                  <button type="button"
                          onClick={() => window.location.href = getApiAuthUrl("/google")}
                          className="w-full flex items-center justify-center gap-3 border 
                                     border-gray-200 dark:border-dark-border rounded-md py-2.5 
                                     text-sm font-medium text-gray-700 dark:text-gray-300
                                     hover:bg-gray-100 dark:hover:bg-dark-card bg-white 
                                     dark:bg-dark-surface transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>

                  <button type="submit" disabled={loading}
                          className="btn-primary w-full disabled:opacity-60">
                    {role === "Artisan" ? "Next " : loading ? "Creating..." : "Create Account"}
                  </button>
                </form>
              )}

              {/* Step 2 — Artisan */}
              {step === 2 && role === "artisan" && (
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 
                                      dark:text-gray-400 mb-1.5 block">Business Name</label>
                    <input name="businessName" value={form.businessName}
                           onChange={handleChange} placeholder="Bright Spark Electrician"
                           required className="input" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 
                                      dark:text-gray-400 mb-1.5 block">Category</label>
                    <select name="category" value={form.category}
                            onChange={handleChange} required className="input">
                      <option value="">Select a category</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 
                                      dark:text-gray-400 mb-1.5 block">Phone Number</label>
                    <input name="phone" value={form.phone} onChange={handleChange}
                           placeholder="08012345678" required className="input" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 
                                      dark:text-gray-400 mb-1.5 block">Address</label>
                    <input name="address" value={form.address} onChange={handleChange}
                           placeholder="Odogunyan, Ikorodu" required className="input" />
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)}
                            className="btn-outline flex-1">← Back</button>
                    <button type="submit" disabled={loading}
                            className="btn-primary flex-1 disabled:opacity-60">
                      {loading ? "Creating..." : "Create Account"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* Switch */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={onSwitch}
                    className="text-green-500 font-semibold hover:underline">
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Main Onboarding Page
export default function Onboarding() {
  const navigate        = useNavigate();
  const { user }        = useAuth();
  const [modal, setModal] = useState(null); // "login" | "register" | null
  const [scrolled, setScrolled] = useState(false);

  // Remove the user navigation logic - this should be handled by routing
  // useEffect(() => {
  //   if (user) {
  //     if (user.role === "admin")       navigate("/admin/dashboard", { replace: true });
  //     else if (user.role === "Artisan") navigate("/artisan/dashboard", { replace: true });
  //     else                             navigate("/user/home",        { replace: true });
  //   }
  // }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stats = [
    { value: "1,254+", label: "Registered Users" },
    { value: "52+",    label: "Verified Artisan" },
    { value: "50+",    label: "Job Categories" },
    { value: "4.8★",   label: "Average Rating" },
  ];

  const features = [
    {
      icon: "🔍",
      title: "Browse & Discover",
      desc: "Search Artisan by name, filter by category, and sort by rating. Find the right professional for any job.",
    },
    {
      icon: "✅",
      title: "Verified Artisan",
      desc: "Every Artisan on Artelix goes through an approval process. Only trusted professionals make the cut.",
    },
    {
      icon: "⭐",
      title: "Ratings & Reviews",
      desc: "Make informed decisions with real ratings from real users. See who's highly rated before you hire.",
    },
    {
      icon: "💬",
      title: "Direct Contact",
      desc: "Call or WhatsApp Artisan directly from their profile. No middleman, no hidden fees.",
    },
    {
      icon: "❤️",
      title: "Save Favorites",
      desc: "Bookmark Artisan you love and access them anytime from your saved Artisan list.",
    },
    {
      icon: "🏢",
      title: "List Your Business",
      desc: "Are you a Artisan? Join Artelix and reach thousands of users looking for your services.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Create your account",
      desc: "Sign up as a user or Artisan in under 2 minutes. No credit card required.",
    },
    {
      step: "02",
      title: "Browse or list",
      desc: "Users browse Artisan by category. Artisan create their profile and wait for approval.",
    },
    {
      step: "03",
      title: "Connect & get the job done",
      desc: "Contact Artisan directly, hire them, and leave a review when the job is complete.",
    },
  ];

  const testimonials = [
    {
      name: "Amara Okafor",
      role: "User",
      text: "Found a plumber within minutes. The verification process gives me peace of mind knowing I'm hiring a trusted professional.",
      avatar: "Amara",
    },
    {
      name: "Chukwu Emeka",
      role: "Artisan — Electrician",
      text: "Since joining Artelix, I've gotten more clients than ever. The platform is simple and my profile speaks for itself.",
      avatar: "Chukwu",
    },
    {
      name: "Fatima Bello",
      role: "User",
      text: "I love how easy it is to compare Artisan by rating. Saved me so much time finding the right tailor for my event.",
      avatar: "Fatima",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg overflow-x-hidden">

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300
                       ${scrolled
                         ? "bg-white/90 dark:bg-dark-bg/90 backdrop-blur-md border-b border-gray-100 dark:border-dark-border"
                         : "bg-transparent"
                       }`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          <h1 className="font-heading text-xl font-bold text-green-500">Artelix</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button onClick={() => setModal("login")}
                    className="btn-outline text-xs sm:text-sm px-3 sm:px-4 py-2">
              Log In
            </button>
            <button onClick={() => setModal("register")}
                    className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2">
              Sign Up Free
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center justify-center relative 
                          overflow-hidden pt-16">

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">

          {/* Badge */}
          <div>
            <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-500/10 
                            rounded-full px-3 sm:px-4 py-2 mb-8">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-green-600 dark:text-green-400 text-xs sm:text-sm font-semibold">
                Nigeria's Trusted Artisan Marketplace
              </span>
            </div>
          </div>

          {/* Headline */}
          <div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 
                           dark:text-gray-100 leading-tight mb-6">
              Find Trusted
              <span className="text-green-500"> Artisan</span>
              <br />Near You
            </h1>
          </div>

          {/* Subheadline */}
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg lg:text-xl 
                          max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect with verified local professionals — plumbers, electricians,
              tailors, cleaners and more. Browse ratings, contact directly, and
              get the job done.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button onClick={() => setModal("register")}
                    className="btn-primary px-6 sm:px-8 py-3 sm:py-4 text-base">
              Get Started — It's Free
            </button>
            <button onClick={() => setModal("login")}
                    className="btn-outline px-6 sm:px-8 py-3 sm:py-4 text-base">
              Log In to Your Account
            </button>
          </div>

          {/* Artisan categories */}
          <div>
            <div className="flex flex-wrap justify-center gap-3">
              {["Plumber", "Electrician", "Tailor", "Cleaner", "Barber", "Photographer"].map((cat) => (
                <div key={cat}
                     className="bg-white dark:bg-dark-card border border-gray-100 
                                dark:border-dark-border rounded-full px-4 py-2 text-sm 
                                font-medium text-gray-600 dark:text-gray-400">
                  {cat}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-16 bg-green-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat) => (
              <StaticSection key={stat.label} className="text-center">
                <p className="font-heading text-3xl sm:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-green-100 text-sm">{stat.label}</p>
              </StaticSection>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 bg-gray-50 dark:bg-dark-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <StaticSection className="text-center mb-16">
            <div className="inline-block bg-green-50 dark:bg-green-500/10 rounded-full 
                            px-4 py-1.5 mb-4">
              <span className="text-green-600 dark:text-green-400 text-sm font-semibold">
                Everything you need
              </span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 
                           dark:text-gray-100 mb-4">
              Why choose Artelix?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              We built Artelix to make finding and hiring local professionals
              as simple as possible.
            </p>
          </StaticSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <StaticSection key={feature.title}>
                <div className="bg-white dark:bg-dark-card border border-gray-100 
                                dark:border-dark-border rounded-2xl p-6 
                                hover:border-green-500 
                                transition-all duration-200">
                  <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-500/10 
                                  flex items-center justify-center text-2xl mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-heading font-semibold text-gray-900 
                                 dark:text-gray-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </StaticSection>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white dark:bg-dark-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <StaticSection className="text-center mb-16">
            <div className="inline-block bg-green-50 dark:bg-green-500/10 rounded-full 
                            px-4 py-1.5 mb-4">
              <span className="text-green-600 dark:text-green-400 text-sm font-semibold">
                Simple process
              </span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 
                           dark:text-gray-100 mb-4">
              How it works
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              Get started in minutes. No complicated setup required.
            </p>
          </StaticSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <StaticSection key={step.step} className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full 
                                  h-px bg-green-200 dark:bg-green-500/20 z-0 
                                  -translate-x-1/2" />
                )}
                <div className="relative z-10 text-center lg:text-left">
                  <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center 
                                  justify-center mx-auto lg:mx-0 mb-4">
                    <span className="font-heading text-white font-bold text-lg">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-gray-900 
                                 dark:text-gray-100 mb-2 text-lg">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </StaticSection>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-gray-50 dark:bg-dark-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <StaticSection className="text-center mb-16">
            <div className="inline-block bg-green-50 dark:bg-green-500/10 rounded-full 
                            px-4 py-1.5 mb-4">
              <span className="text-green-600 dark:text-green-400 text-sm font-semibold">
                What people say
              </span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 
                           dark:text-gray-100 mb-4">
              Trusted by users across Nigeria
            </h2>
          </StaticSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <StaticSection key={t.name}>
                <div className="bg-white dark:bg-dark-card border border-gray-100 
                                dark:border-dark-border rounded-2xl p-6">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, s) => (
                      <svg key={s} className="w-4 h-4 text-amber-400"
                           fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm 
                                leading-relaxed mb-5">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${t.avatar}`}
                         alt={t.name}
                         className="w-10 h-10 rounded-full bg-green-50 border 
                                    border-gray-100 dark:border-dark-border" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {t.name}
                      </p>
                      <p className="text-2xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </StaticSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-green-500 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-10"
               style={{ background: "white", transform: "translate(-30%, -30%)" }} />
          <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full opacity-10"
               style={{ background: "white", transform: "translate(30%, 30%)" }} />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <StaticSection>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-green-100 text-base sm:text-lg mb-10 max-w-xl mx-auto">
              Join over 1,254 users and 52 verified Artisan already on Artelix.
              It's completely free to sign up.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => setModal("register")}
                      className="bg-white text-green-600 font-semibold px-8 py-4 
                                 rounded-lg text-base hover:bg-green-50 transition-colors">
                Create Free Account
              </button>
              <button onClick={() => setModal("login")}
                      className="border-2 border-white text-white font-semibold 
                                 px-8 py-4 rounded-lg text-base hover:bg-white/10 
                                 transition-colors">
                Log In
              </button>
            </div>
          </StaticSection>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-dark-surface border-t border-gray-100 
                         dark:border-dark-border py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row 
                        items-center justify-between gap-4">
          <h1 className="font-heading text-lg font-bold text-green-500">Artelix</h1>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Artelix. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="/forgot-password"
               className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
              Support
            </a>
            <button onClick={() => setModal("login")}
                    className="text-green-500 font-semibold text-sm hover:underline">
              Log In
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {modal && (
        <AuthModal
          mode={modal}
          onClose={() => setModal(null)}
          onSwitch={() => setModal(modal === "login" ? "register" : "login")}
        />
      )}
    </div>
  );
}
