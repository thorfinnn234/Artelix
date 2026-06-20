import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../context/AuthContext";

export default function AdminSettings() {
  const { user } = useAuth();

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Admin account settings
        </p>
      </div>
      <div className="max-w-lg">
        <div className="card">
          <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Admin Account
          </h2>
          <div className="flex items-center gap-4 mb-6">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.fullName}
                   className="w-16 h-16 rounded-2xl border-2 border-green-500" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center 
                              justify-center text-white font-bold text-2xl">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-heading font-bold text-gray-900 dark:text-gray-100">
                {user?.fullName}
              </p>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <span className="text-2xs bg-red-50 dark:bg-red-500/10 text-red-600 
                               dark:text-red-400 font-semibold px-2 py-0.5 
                               rounded-full mt-1 inline-block">
                Admin
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-400 text-center py-4 border-t 
                        border-gray-100 dark:border-dark-border">
            More settings coming soon
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}