import MessageCenter from "../../components/MessageCenter";
import UserLayout from "../../layouts/UserLayout";

export default function Messages() {
  return (
    <UserLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
          Messages
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Your conversations with artisans
        </p>
      </div>
      <MessageCenter
        emptyAction={
          <a href="/user/home" className="btn-primary text-sm mt-4">
            Browse Artisans
          </a>
        }
      />
    </UserLayout>
  );
}
