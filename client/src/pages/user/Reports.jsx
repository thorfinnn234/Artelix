import UserLayout from "../../layouts/UserLayout";

export default function Reports() {
  return (
    <UserLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
          Reports
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Track reports and safety concerns you have submitted
        </p>
      </div>

      <div className="card max-w-2xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100">
              No reports yet
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              If you report an artisan or a listing, updates will appear here.
            </p>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
