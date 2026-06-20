import mongoose from "mongoose";
import Artisan from "../models/artisan.js";
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import Notification from "../models/notification.js";

function isParticipant(user, conversation) {
  const userId = user._id.toString();
  const role = String(user.role || "").toLowerCase();

  return (
    (role === "user" && conversation.userId.toString() === userId) ||
    (role === "artisan" && conversation.artisanOwnerId.toString() === userId)
  );
}

async function populateConversation(query) {
  return query
    .populate("userId", "fullName email avatar")
    .populate("artisanId", "name category status ownerId")
    .populate("artisanOwnerId", "fullName email avatar");
}

function serializeConversation(conversation) {
  return {
    _id:            conversation._id,
    user:           conversation.userId,
    artisan:        conversation.artisanId,
    artisanOwner:   conversation.artisanOwnerId,
    lastMessage:    conversation.lastMessage,
    lastMessageAt:  conversation.lastMessageAt,
    userUnreadCount: conversation.userUnreadCount,
    artisanUnreadCount: conversation.artisanUnreadCount,
    isActive:       conversation.isActive,
    createdAt:      conversation.createdAt,
    updatedAt:      conversation.updatedAt,
  };
}

function getRole(user) {
  return String(user.role || "").toLowerCase();
}

function getUnreadField(user) {
  return getRole(user) === "artisan" ? "artisanUnreadCount" : "userUnreadCount";
}

async function notifyUser({ userId, type = "message", title, message, link }) {
  await Notification.create({ userId, type, title, message, link });
}

export async function startArtisanConversation(req, res) {
  const role = String(req.user.role || "").toLowerCase();
  if (role !== "user") {
    return res.status(403).json({ message: "Only users can start artisan conversations." });
  }

  const { artisanId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(artisanId)) {
    return res.status(400).json({ message: "Invalid artisan id" });
  }

  const artisan = await Artisan.findById(artisanId);
  if (!artisan) return res.status(404).json({ message: "Artisan not found" });
  if (artisan.status !== "approved") {
    return res.status(403).json({ message: "This artisan is not available for messages." });
  }

  let conversation = await Conversation.findOne({
    userId: req.user._id,
    artisanId: artisan._id,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      userId:         req.user._id,
      artisanId:      artisan._id,
      artisanOwnerId: artisan.ownerId,
      isActive:       true,
    });

    await notifyUser({
      userId:  artisan.ownerId,
      title:   "New conversation",
      message: `${req.user.fullName} started a conversation with ${artisan.name}.`,
      link:    `/artisan/messages?conversation=${conversation._id}`,
    });
  }

  const populated = await populateConversation(Conversation.findById(conversation._id));
  res.status(201).json({ conversation: serializeConversation(populated) });
}

export async function listConversations(req, res) {
  const role = String(req.user.role || "").toLowerCase();
  const filter =
    role === "user"
      ? { userId: req.user._id }
      : role === "artisan"
        ? { artisanOwnerId: req.user._id }
        : null;

  if (!filter) {
    return res.status(403).json({ message: "Messages are only available to users and artisans." });
  }

  const conversations = await populateConversation(
    Conversation.find(filter).sort({ lastMessageAt: -1, updatedAt: -1 }),
  );

  res.json({ conversations: conversations.map(serializeConversation) });
}

export async function getConversationMessages(req, res) {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) return res.status(404).json({ message: "Conversation not found" });
  if (!isParticipant(req.user, conversation)) {
    return res.status(403).json({ message: "You cannot access this conversation." });
  }

  const unreadField = getUnreadField(req.user);
  if (conversation[unreadField] > 0) {
    conversation[unreadField] = 0;
    await conversation.save();
  }

  const messages = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 })
    .populate("senderId", "fullName avatar role");

  res.json({ messages });
}

export async function sendMessage(req, res) {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) return res.status(404).json({ message: "Conversation not found" });
  if (!conversation.isActive) {
    return res.status(403).json({ message: "This conversation is not active." });
  }
  if (!isParticipant(req.user, conversation)) {
    return res.status(403).json({ message: "You cannot send messages in this conversation." });
  }

  const body = String(req.body.body || "").trim();
  if (!body) return res.status(400).json({ message: "Message is required." });

  const message = await Message.create({
    conversationId: conversation._id,
    senderId:       req.user._id,
    body,
  });

  conversation.lastMessage = body;
  conversation.lastMessageAt = message.createdAt;
  const senderRole = getRole(req.user);
  const recipientId =
    senderRole === "artisan" ? conversation.userId : conversation.artisanOwnerId;
  const recipientLink =
    senderRole === "artisan"
      ? `/user/messages?conversation=${conversation._id}`
      : `/artisan/messages?conversation=${conversation._id}`;

  if (senderRole === "artisan") {
    conversation.userUnreadCount += 1;
  } else {
    conversation.artisanUnreadCount += 1;
  }

  await conversation.save();

  await notifyUser({
    userId:  recipientId,
    title:   "New message",
    message: `${req.user.fullName}: ${body.slice(0, 120)}`,
    link:    recipientLink,
  });

  const populated = await message.populate("senderId", "fullName avatar role");
  res.status(201).json({ message: populated });
}

export async function markAllConversationsRead(req, res) {
  const role = getRole(req.user);
  const filter =
    role === "user"
      ? { userId: req.user._id }
      : role === "artisan"
        ? { artisanOwnerId: req.user._id }
        : null;

  if (!filter) {
    return res.status(403).json({ message: "Messages are only available to users and artisans." });
  }

  await Conversation.updateMany(filter, { [getUnreadField(req.user)]: 0 });
  res.json({ message: "Messages marked as read" });
}
