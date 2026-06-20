import NotificationCenter from "../../components/NotificationCenter";
import ArtisanLayout from "../../layouts/ArtisanLayout";

export default function ArtisanNotifications() {
  return (
    <ArtisanLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
          Notifications
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          All your notifications in one place
        </p>
      </div>
      <NotificationCenter />
    </ArtisanLayout>
  );
}
