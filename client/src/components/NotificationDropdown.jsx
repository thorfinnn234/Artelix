import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Bookmark, MessageCircle, Star, Wrench } from "lucide-react";
import { useAuth } from "../context/AuthContext";
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
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getNotificationsRoute(role) {
  return role === "artisan" ? "/artisan/notifications" : "/user/notifications";
}

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  const loadNotifications = () => {
    if (!user) return;
    setLoading(true);
    getNotifications()
      .then((data) => setNotifications(data.notifications || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id, user?._id]);

  useEffect(() => {
    if (open) loadNotifications();
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        readAt: notification.readAt || new Date().toISOString(),
      })),
    );
  };

  const openNotification = async (notification) => {
    if (!notification.readAt) {
      await markNotificationRead(notification._id);
      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? { ...item, readAt: new Date().toISOString() }
            : item,
        ),
      );
    }

    navigate(notification.link || getNotificationsRoute(role));
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card transition-colors"
        aria-label="Open notifications"
      >
        <Bell className="w-6 h-6" strokeWidth={1.2} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-red-500 rounded-full text-white text-2xs flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-[calc(100vw-1rem)] max-w-80 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-semibold text-sm text-gray-900 dark:text-gray-100">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-2xs font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-2xs text-green-500 font-semibold hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length ? (
              notifications.slice(0, 5).map((notification) => {
                const Icon = icons[notification.type] || Bell;
                const unread = !notification.readAt;

                return (
                  <button
                    key={notification._id}
                    onClick={() => openNotification(notification)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-card transition-colors border-b border-gray-50 dark:border-dark-border last:border-0 ${
                      unread ? "bg-green-50/50 dark:bg-green-500/5" : ""
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold leading-tight ${unread ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}>
                        {notification.title}
                      </p>
                      <p className="text-2xs text-gray-400 mt-0.5 truncate">
                        {notification.message}
                      </p>
                      <p className="text-2xs text-gray-300 dark:text-gray-600 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {unread && (
                      <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  No notifications yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Updates will appear here when something happens.
                </p>
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-100 dark:border-dark-border">
            <button
              onClick={() => {
                navigate(getNotificationsRoute(role));
                setOpen(false);
              }}
              className="w-full text-center text-sm text-green-500 font-semibold hover:underline"
            >
              See all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
