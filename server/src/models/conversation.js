import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    artisanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artisan",
      required: true,
      index: true,
    },
    artisanOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: null },
    userUnreadCount: { type: Number, default: 0 },
    artisanUnreadCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

conversationSchema.index({ userId: 1, artisanId: 1 }, { unique: true });
conversationSchema.index({ artisanOwnerId: 1, lastMessageAt: -1 });
conversationSchema.index({ userId: 1, lastMessageAt: -1 });

export default mongoose.model("Conversation", conversationSchema);
