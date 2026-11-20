import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser } from "../services/authService";
import { getApiAuthUrl } from "../services/api";
import { ArrowUpRight, ArrowRight, Search, ShieldCheck, MessageCircle, Wrench, Zap, Scissors, Paintbrush, Hammer, Sparkles, Check, Bookmark } from "lucide-react";
import "./Onboarding.css";
import ThemeToggle from "../components/ThemeToggle";


// Modal Component
function AuthModal({ mode, initialRole = "user", onClose, onSwitch }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    const focusable = () => [...dialog.querySelectorAll('button, input, select, a[href]')].filter(el => !el.disabled && el.getClientRects().length);
    focusable()[0]?.focus();
    const trapFocus = (event) => {
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    dialog.addEventListener("keydown", trapFocus);
    return () => { dialog.removeEventListener("keydown", trapFocus); previousFocus?.focus(); };
  }, []);
  const navigate          = useNavigate();
  const { login }         = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole]   = useState(initialRole);
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
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (!isStrongPassword(form.password)) return setError("Password must include letters, numbers and a symbol.");
    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName,
        email:    form.email,
        password: form.password,
        role,
        ...(role === "artisan" && {
          artisan: {
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
      ref={dialogRef} role="dialog" aria-modal="true" aria-label={mode === "login" ? "Log in" : "Create an account"}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white dark:bg-dark-surface rounded-2xl w-full max-w-md 
                   relative max-h-[90dvh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          aria-label="Close dialog"
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
                {["user", "artisan"].map((r) => (
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
                <form onSubmit={role === "artisan" ? handleNextStep : handleRegister}
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
                    {role === "artisan" ? "Next " : loading ? "Creating..." : "Create Account"}
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

const services = [
  { name: "Plumbing", icon: Wrench, profession: "plumber" },
  { name: "Electrical", icon: Zap, profession: "electrician" },
  { name: "Carpentry", icon: Hammer, profession: "carpenter" },
  { name: "Tailoring", icon: Scissors, profession: "tailor" },
  { name: "Painting", icon: Paintbrush, profession: "painter" },
  { name: "Cleaning", icon: Sparkles, profession: "cleaner" },
];
export default function Onboarding() {
  const [modal, setModal] = useState(null);
  const [initialRole, setInitialRole] = useState("user");
  const [selected, setSelected] = useState(0);
  const openSignup = (role = "user") => { setInitialRole(role); setModal("register"); };
  useEffect(() => {
    if (!modal) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event) => { if (event.key === "Escape") setModal(null); };
    window.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", handleKey); };
  }, [modal]);
  const ServiceIcon = services[selected].icon;
  return (
    <div className="onboarding" id="top">
      <header className="ob-header">
        <a className="ob-brand" href="#top" aria-label="Artelix home"><span className="ob-brand-mark"><Hammer size={21}/></span>artelix<span className="ob-brand-dot">.</span></a>
        <nav className="ob-nav" aria-label="Main navigation"><a href="#services">Explore services</a><a href="#how-it-works">How it works</a><button onClick={() => openSignup("artisan")}>For artisans <ArrowUpRight size={14}/></button></nav>
        <div className="ob-header-actions"><ThemeToggle/><button className="ob-login" onClick={() => setModal("login")}>Log in</button><button className="ob-button ob-small" onClick={() => openSignup()}>Get started <ArrowUpRight size={16}/></button></div>
      </header>
      <main>
        <section className="ob-hero ob-container">
          <div className="ob-hero-copy">
            <div className="ob-eyebrow"><span/> LOCAL TALENT. REAL POSSIBILITIES.</div>
            <h1>Good hands.<br/>Great work.<br/><span>Right near you.</span></h1>
            <p>From the little fixes to the big ideas. Discover skilled artisans across Nigeria and connect with the right person to bring it all together.</p>
            <div className="ob-hero-actions"><button className="ob-button" onClick={() => openSignup()}>Find your artisan <ArrowUpRight size={19}/></button><a className="ob-text-link" href="#how-it-works">See how it works <ArrowRight size={17}/></a></div>
            <div className="ob-hero-assurances"><span><ShieldCheck size={17}/> Reviewed artisan profiles</span><span><Check size={17}/> Free to join</span></div>
          </div>
          <div className="ob-showcase" aria-label="Preview of finding an artisan">
            <div className="ob-showcase-top"><span>SKILLS THAT MAKE A DIFFERENCE</span><span>0{selected+1} / 06</span></div>
            <div className="ob-illustration"><div className="ob-orbit ob-orbit-one"/><div className="ob-orbit ob-orbit-two"/><span className="ob-float-tool ob-tool-one"><Hammer size={36}/></span><span className="ob-float-tool ob-tool-two"><Zap size={30}/></span><div className="ob-main-tool"><ServiceIcon size={96} strokeWidth={1.3}/></div><span className="ob-illustration-label">A little expertise.<br/>A lot of possibility.</span><span className="ob-spark" aria-hidden="true">✳</span></div>
            <div className="ob-preview-card"><div className="ob-preview-heading"><span className="ob-preview-avatar"><ServiceIcon size={25}/></span><div><strong>Find your next {services[selected].profession}</strong><span>Discover local professionals</span></div><ShieldCheck className="ob-verified" size={25}/></div><div className="ob-preview-tags"><span>Explore profiles</span><span>Read reviews</span><span>Connect directly</span></div><button onClick={() => openSignup()} className="ob-preview-link">Find the right fit <ArrowUpRight size={17}/></button></div>
            <div className="ob-floating-note"><span><Check size={16}/></span> Your next project starts here.</div>
          </div>
        </section>
        <section className="ob-services ob-container" id="services"><div className="ob-section-line"><div><span className="ob-kicker">MADE FOR YOUR EVERYDAY</span><h2>What can we help with?</h2></div><span className="ob-service-hint">A skill for every project.</span></div><div className="ob-service-grid">{services.map(({name, icon: Icon}, i) => <button key={name} className={`ob-service ${selected === i ? "is-selected" : ""}`} onClick={() => setSelected(i)} aria-pressed={selected === i}><Icon size={27} strokeWidth={1.5}/><span>{name}</span><ArrowUpRight size={15}/></button>)}</div></section>
        <section className="ob-process" id="how-it-works"><div className="ob-container"><div className="ob-section-line"><div><span className="ob-kicker">LESS SEARCHING. MORE DOING.</span><h2>The right connection.<br/>In three simple steps.</h2></div><p>Finding someone for the job should be<br/> the easiest part of your project.</p></div><div className="ob-step-grid">{[{icon: Search, title: "Discover your match", text: "Create a free account and explore artisans by the skills you need."},{icon: Bookmark, title: "Find your confidence", text: "Explore their work, compare reviews, and save the profiles you love."},{icon: MessageCircle, title: "Make it happen", text: "Connect directly, discuss your project, and agree on the details together."}].map(({icon: Icon, title, text}, i) => <article className="ob-step" key={title}><div className="ob-step-top"><Icon size={25} strokeWidth={1.5}/><span>0{i+1}</span></div><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
        <section className="ob-artisan ob-container"><div><span className="ob-kicker">FOR THE HANDS BEHIND THE WORK</span><h2>Your craft deserves<br/>to be discovered.</h2><p>Give your skills a home. Create your artisan profile, showcase your work, and help new customers find you.</p><button className="ob-button" onClick={() => openSignup("artisan")}>Join as an artisan <ArrowUpRight size={18}/></button></div><div className="ob-artisan-art" aria-hidden="true"><span className="ob-craft-word">Made with<br/><em>skill.</em></span><span className="ob-craft-stamp"><Wrench size={26}/> LOCAL SKILLS<br/> BIG POTENTIAL</span></div></section>
      </main>
      <footer className="ob-footer ob-container"><a className="ob-brand" href="#top">artelix<span className="ob-brand-dot">.</span></a><p>Connecting people. Celebrating craft.</p><span>© {new Date().getFullYear()} Artelix</span><a href="/forgot-password">Account support <ArrowUpRight size={14}/></a></footer>
      {modal && <AuthModal key={modal} mode={modal} initialRole={initialRole} onClose={() => setModal(null)} onSwitch={() => setModal(modal === "login" ? "register" : "login")}/>}
    </div>
  );
}