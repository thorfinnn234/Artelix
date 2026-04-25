import UserLayout from "../../layouts/UserLayout";

export default function Notifications() {
  return (
    <UserLayout>
      <div className="mb-6">
        <h1
          className="font-heading text-2xl font-bold text-gray-900 
                       dark:text-gray-100"
        >
          Notifications
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          All your notifications in one place
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
          <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 01-3.46 0"></path>
        </svg>
        <h3
          className="font-heading font-semibold text-gray-900 
                       dark:text-gray-100 mb-1"
        >
          No notifications yet
        </h3>
        <p className="text-gray-400 text-sm">
          We'll notify you when something happens
        </p>
      </div>
    </UserLayout>
  );
}
