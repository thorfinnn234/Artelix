import { useEffect, useState } from "react";
import { Bell, Bookmark, CheckCheck, MessageCircle, Star, Wrench } from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";

const icons = {
  artisan: Wrench,
  message: MessageCircle,
  review: Star,
  saved: Bookmark,
  system: Bell,
};

function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  useEffect(() => {
    getNotifications()
      .then((data) => setNotifications(data.notifications || []))
      .catch((err) => setError(err?.response?.data?.message || "Unable to load notifications."))
      .finally(() => setLoading(false));
  }, []);

  const markOneRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((current) =>
      current.map((notification) =>
        notification._id === id
          ? { ...notification, readAt: notification.readAt || new Date().toISOString() }
          : notification,
      ),
    );
  };

  const markAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        readAt: notification.readAt || new Date().toISOString(),
      })),
    );
  };

  if (loading) {
    return (
      <div className="card h-72 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Bell className="w-8 h-8 text-gray-400 mb-3" />
        <h3 className="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-1">
          No notifications yet
        </h3>
        <p className="text-gray-400 text-sm">
          Updates will appear here when something happens.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
        </p>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="btn-ghost text-sm inline-flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        {notifications.map((notification, index) => {
          const Icon = icons[notification.type] || Bell;
          const unread = !notification.readAt;

          return (
            <button
              key={notification._id}
              onClick={() => markOneRead(notification._id)}
              className={`w-full text-left flex items-start gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-dark-card transition-colors ${
                index !== notifications.length - 1 ? "border-b border-gray-100 dark:border-dark-border" : ""
              } ${unread ? "bg-green-50/50 dark:bg-green-500/5" : ""}`}
            >
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <h3 className={`text-sm font-semibold ${unread ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"}`}>
                    {notification.title}
                  </h3>
                  <span className="text-2xs text-gray-300 dark:text-gray-600 shrink-0">
                    {formatTime(notification.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
              </div>
              {unread && <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
