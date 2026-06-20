import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getConversations,
  markAllConversationsRead,
} from "../services/messageService";

function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getUnreadCount(conversation, role) {
  return role === "artisan"
    ? conversation.artisanUnreadCount || 0
    : conversation.userUnreadCount || 0;
}

function getTitle(conversation, role) {
  if (role === "artisan") return conversation.user?.fullName || "User";
  return conversation.artisan?.name || conversation.artisanOwner?.fullName || "Artisan";
}

function getSubtitle(conversation, role) {
  if (conversation.lastMessage) return conversation.lastMessage;
  if (role === "artisan") return conversation.user?.email || "No messages yet";
  return conversation.artisan?.category || "No messages yet";
}

function getMessageRoute(role, id) {
  const base = role === "artisan" ? "/artisan/messages" : "/user/messages";
  return id ? `${base}?conversation=${id}` : base;
}

export default function MessageDropdown() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const unreadCount = conversations.reduce(
    (total, conversation) => total + getUnreadCount(conversation, role),
    0,
  );

  const loadConversations = () => {
    if (!user) return;
    setLoading(true);
    getConversations()
      .then((data) => setConversations(data.conversations || []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadConversations();
  }, [user?.id, user?._id]);

  useEffect(() => {
    if (open) loadConversations();
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await markAllConversationsRead();
    setConversations((current) =>
      current.map((conversation) => ({
        ...conversation,
        userUnreadCount: 0,
        artisanUnreadCount: 0,
      })),
    );
  };

  const openConversation = (conversation) => {
    navigate(getMessageRoute(role, conversation._id));
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card transition-colors"
        aria-label="Open messages"
      >
        <Mail className="w-6 h-6" strokeWidth={1.2} />
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
                Messages
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
            ) : conversations.length ? (
              conversations.slice(0, 5).map((conversation) => {
                const unread = getUnreadCount(conversation, role);
                const title = getTitle(conversation, role);

                return (
                  <button
                    key={conversation._id}
                    onClick={() => openConversation(conversation)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-card transition-colors border-b border-gray-50 dark:border-dark-border last:border-0 ${
                      unread ? "bg-green-50/50 dark:bg-green-500/5" : ""
                    }`}
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(title)}`}
                      alt={title}
                      className="w-9 h-9 rounded-full bg-green-50 border border-gray-100 dark:border-dark-border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-semibold truncate ${unread ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}>
                          {title}
                        </p>
                        <span className="text-2xs text-gray-300 dark:text-gray-600 shrink-0 ml-2">
                          {formatTime(conversation.lastMessageAt || conversation.updatedAt)}
                        </span>
                      </div>
                      <p className="text-2xs text-gray-400 mt-0.5 truncate">
                        {getSubtitle(conversation, role)}
                      </p>
                    </div>
                    {unread > 0 && (
                      <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  No messages yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Conversations will appear here once they start.
                </p>
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-100 dark:border-dark-border">
            <button
              onClick={() => {
                navigate(getMessageRoute(role));
                setOpen(false);
              }}
              className="w-full text-center text-sm text-green-500 font-semibold hover:underline"
            >
              See all messages
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
