import Notification from "../models/notification.js";
import User from "../models/User.js";

// Notifications are a side effect: a failure here must never fail the request
// that triggered it, because the underlying change has already been saved.
export async function notifyUser({ userId, type = "system", title, message, link = "" }) {
  if (!userId) return;
  try {
    await Notification.create({ userId, type, title, message: String(message).slice(0, 500), link });
  } catch (error) {
    console.error(`Notification failed (${title}):`, error.message);
  }
}

export async function notifyAdmins(payload) {
  try {
    const admins = await User.find({ role: "admin" }).select("_id").lean();
    await Promise.all(admins.map((admin) => notifyUser({ ...payload, userId: admin._id })));
  } catch (error) {
    console.error(`Admin notification failed (${payload.title}):`, error.message);
  }
}
