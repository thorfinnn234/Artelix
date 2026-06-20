import Notification from "../models/notification.js";

export async function listNotifications(req, res) {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    readAt: null,
  });

  res.json({ notifications, unreadCount });
}

export async function markNotificationRead(req, res) {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { readAt: new Date() },
    { new: true },
  );

  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  res.json({ notification });
}

export async function markAllNotificationsRead(req, res) {
  await Notification.updateMany(
    { userId: req.user._id, readAt: null },
    { readAt: new Date() },
  );

  res.json({ message: "Notifications marked as read" });
}
