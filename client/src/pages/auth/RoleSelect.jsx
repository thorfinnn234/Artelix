import { AuthBrandPanel } from "../../components/SiteDesign";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../../components/ThemeToggle";

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="auth-page min-h-screen flex">

      <AuthBrandPanel/>
      {/* RIGHT — Role Select */}
      <div className="auth-form-panel w-full lg:w-1/2 bg-gray-50 dark:bg-dark-bg flex
                      items-center justify-center px-6 py-10 relative">

        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="auth-form-content w-full max-w-md">

          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <h1 className="font-heading text-3xl font-bold text-green-500">Artelix</h1>
          </div>

          <div className="mb-10">
            <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
              Join Artelix 🎉
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Who are you signing up as?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => navigate("/register/form?role=user")}
              className="card flex flex-col items-center gap-3 py-8 
                         hover:border-green-500 transition-all 
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
                <p className="text-2xs text-gray-400 mt-0.5">Find & hire Artisan</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/register/form?role=artisan")}
              className="card flex flex-col items-center gap-3 py-8 
                         hover:border-green-500 transition-all 
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
                  Artisan
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