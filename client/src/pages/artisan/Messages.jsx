import MessageCenter from "../../components/MessageCenter";
import ArtisanLayout from "../../layouts/ArtisanLayout";

export default function ArtisanMessages() {
  return (
    <ArtisanLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
          Messages
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Your conversations with users
        </p>
      </div>
      <MessageCenter />
    </ArtisanLayout>
  );
}
