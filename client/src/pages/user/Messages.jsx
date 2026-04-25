import UserLayout from "../../layouts/UserLayout";

export default function Messages() {
  return (
    <UserLayout>
      <div className="mb-6">
        <h1
          className="font-heading text-2xl font-bold text-gray-900 
                       dark:text-gray-100"
        >
          Messages
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Your conversations with vendors
        </p>
      </div>
      <div className="flex flex-col items-center justify-center py-20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="5" width="18" height="14" rx="3" ry="3"></rect>
          <path d="M3 7l9 6 9-6"></path>
        </svg>
        <h3
          className="font-heading font-semibold text-gray-900 
                       dark:text-gray-100 mb-1"
        >
          No messages yet
        </h3>
        <p className="text-gray-400 text-sm text-center max-w-xs">
          Contact a vendor from their profile page to start a conversation
        </p>
        <a href="/user/home" className="btn-primary text-sm mt-4">
          Browse Vendors
        </a>
      </div>
    </UserLayout>
  );
}
