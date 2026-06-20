import { useEffect, useMemo, useState } from "react";
import { Mail, Send } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getConversationMessages,
  getConversations,
  sendConversationMessage,
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

function getConversationTitle(conversation, role) {
  if (role === "artisan") return conversation.user?.fullName || "User";
  return conversation.artisan?.name || conversation.artisanOwner?.fullName || "Artisan";
}

function getConversationSubtitle(conversation, role) {
  if (role === "artisan") return conversation.user?.email || "Artelix user";
  return conversation.artisan?.category || conversation.artisanOwner?.email || "Artelix artisan";
}

function getAvatarSeed(conversation, role) {
  if (role === "artisan") return conversation.user?.fullName || "User";
  return conversation.artisan?.name || "Artisan";
}

export default function MessageCenter({ emptyAction }) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = String(user?.role || "").toLowerCase();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(searchParams.get("conversation") || "");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    setLoading(true);
    getConversations()
      .then((data) => {
        if (!alive) return;
        const items = data.conversations || [];
        setConversations(items);
        const requested = searchParams.get("conversation");
        const exists = items.some((item) => item._id === requested);
        setSelectedId(exists ? requested : items[0]?._id || "");
      })
      .catch((err) => setError(err?.response?.data?.message || "Unable to load messages."))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [searchParams]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    setThreadLoading(true);
    getConversationMessages(selectedId)
      .then((data) => setMessages(data.messages || []))
      .catch((err) => setError(err?.response?.data?.message || "Unable to load conversation."))
      .finally(() => setThreadLoading(false));
  }, [selectedId]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation._id === selectedId),
    [conversations, selectedId],
  );

  const selectConversation = (id) => {
    setSelectedId(id);
    setSearchParams(id ? { conversation: id } : {});
    setError("");
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !selectedId || sending) return;

    setSending(true);
    setError("");
    try {
      const data = await sendConversationMessage(selectedId, body);
      setMessages((current) => [...current, data.message]);
      setDraft("");
      setConversations((current) =>
        current
          .map((conversation) =>
            conversation._id === selectedId
              ? {
                  ...conversation,
                  lastMessage: body,
                  lastMessageAt: data.message.createdAt,
                }
              : conversation,
          )
          .sort((a, b) => new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt)),
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="card h-80 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Mail className="w-8 h-8 text-gray-400 mb-3" />
        <h3 className="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-1">
          No messages yet
        </h3>
        <p className="text-gray-400 text-sm text-center max-w-xs">
          {role === "artisan"
            ? "Users will appear here after starting a conversation from your artisan profile."
            : "Contact an artisan from their profile page to start a conversation."}
        </p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] gap-4 min-w-0">
      <div className="card p-0 overflow-hidden min-w-0">
        {conversations.map((conversation, index) => {
          const selected = conversation._id === selectedId;
          const title = getConversationTitle(conversation, role);
          const subtitle = getConversationSubtitle(conversation, role);

          return (
            <button
              key={conversation._id}
              onClick={() => selectConversation(conversation._id)}
              className={`w-full text-left flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-dark-card transition-colors ${
                index !== conversations.length - 1 ? "border-b border-gray-100 dark:border-dark-border" : ""
              } ${selected ? "bg-green-50/70 dark:bg-green-500/10" : ""}`}
            >
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(getAvatarSeed(conversation, role))}`}
                alt={title}
                className="w-11 h-11 rounded-full bg-green-50 border border-gray-100 dark:border-dark-border shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {title}
                  </p>
                  <span className="text-2xs text-gray-300 dark:text-gray-600 shrink-0">
                    {formatTime(conversation.lastMessageAt || conversation.updatedAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">{conversation.lastMessage || subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="card p-0 overflow-hidden flex flex-col min-h-[460px] sm:min-h-[520px] min-w-0">
        <div className="px-4 py-4 border-b border-gray-100 dark:border-dark-border">
          <h2 className="font-heading font-semibold text-gray-900 dark:text-gray-100">
            {selectedConversation ? getConversationTitle(selectedConversation, role) : "Conversation"}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {selectedConversation ? getConversationSubtitle(selectedConversation, role) : ""}
          </p>
        </div>

        {error && (
          <div className="mx-4 mt-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
          {threadLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-7 h-7 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length ? (
            messages.map((message) => {
              const mine = String(message.senderId?._id || message.senderId) === String(user?.id || user?._id);
              return (
                <div key={message._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] sm:max-w-[78%] rounded-lg px-4 py-2 min-w-0 ${
                      mine
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 dark:bg-dark-card text-gray-800 dark:text-gray-100"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.body}</p>
                    <p className={`text-2xs mt-1 ${mine ? "text-green-50" : "text-gray-400"}`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <p className="text-sm text-gray-400">Send the first message in this conversation.</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-2 sm:gap-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="input flex-1"
              placeholder="Type a message"
              maxLength={2000}
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="btn-primary px-4 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
