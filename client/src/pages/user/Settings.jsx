import UserLayout from "../../layouts/UserLayout";
import { useAuth } from "../../context/AuthContext";

export default function UserSettings() {
  const { user } = useAuth();

  return (
    <UserLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Manage your account preferences
        </p>
      </div>

      <div className="max-w-lg">
        <div className="card">
          <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Account
          </h2>
          <div className="flex items-center gap-4 mb-6">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-14 h-14 rounded-full border-2 border-green-500"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xl">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-heading font-bold text-gray-900 dark:text-gray-100">
                {user?.fullName}
              </p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-dark-border pt-4">
            <p className="text-sm text-gray-400">
              More notification and privacy settings coming soon.
            </p>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
