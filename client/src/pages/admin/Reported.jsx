import AdminLayout from "../../layouts/AdminLayout";

export default function AdminReported() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
          Reported Artisan
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Artisan reported by users
        </p>
      </div>
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 
                        flex items-center justify-center mb-4 text-3xl">
          🚩
        </div>
        <h3 className="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-1">
          No reported Artisan
        </h3>
        <p className="text-gray-400 text-sm text-center max-w-xs">
          When users report Artisan they will appear here for review
        </p>
      </div>
    </AdminLayout>
  );
}