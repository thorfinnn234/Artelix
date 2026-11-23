import NotificationCenter from "../../components/NotificationCenter";
import AdminLayout from "../../layouts/AdminLayout";

export default function AdminNotifications() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="page-title">Notifications</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">New appeals, disputes, reports and support requests</p>
      </div>
      <NotificationCenter />
    </AdminLayout>
  );
}
