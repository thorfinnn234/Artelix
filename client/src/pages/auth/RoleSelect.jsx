import { useNavigate } from "react-router-dom";
import ThemeToggle from "../../components/ThemeToggle";
import HeroIllustration from "../../assets/undraw_reviews_ukai.svg";

export default function RoleSelect() {
  const navigate = useNavigate();

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
          <h1 className="font-heading text-4xl font-bold text-white mb-2">Vendorly</h1>
          <p className="text-green-100 text-base">Your trusted vendor marketplace</p>
        </div>

        <div className="relative z-10 w-full max-w-sm mb-10">
          <img src={HeroIllustration} alt="Vendorly"
               className="w-full drop-shadow-xl" />
        </div>

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

      {/* RIGHT — Role Select */}
      <div className="w-full lg:w-1/2 bg-gray-50 dark:bg-dark-bg flex 
                      items-center justify-center px-6 py-10 relative">

        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <h1 className="font-heading text-3xl font-bold text-green-500">Vendorly</h1>
          </div>

          <div className="mb-10">
            <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
              Join Vendorly 🎉
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Who are you signing up as?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => navigate("/register/form?role=user")}
              className="card flex flex-col items-center gap-3 py-8 
                         hover:border-green-500 hover:shadow-sm transition-all 
                         duration-200 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-green-50 dark:bg-green-500/10 
                              flex items-center justify-center group-hover:bg-green-500 
                              transition-colors">
                <svg className="w-7 h-7 text-green-500 group-hover:text-white transition-colors"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-heading font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  User
                </p>
                <p className="text-2xs text-gray-400 mt-0.5">Find & hire vendors</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/register/form?role=vendor")}
              className="card flex flex-col items-center gap-3 py-8 
                         hover:border-green-500 hover:shadow-sm transition-all 
                         duration-200 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-green-50 dark:bg-green-500/10 
                              flex items-center justify-center group-hover:bg-green-500 
                              transition-colors">
                <svg className="w-7 h-7 text-green-500 group-hover:text-white transition-colors"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-heading font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  Vendor
                </p>
                <p className="text-2xs text-gray-400 mt-0.5">Offer your services</p>
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <button onClick={() => navigate("/login")}
                    className="text-green-500 font-semibold hover:underline">
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}