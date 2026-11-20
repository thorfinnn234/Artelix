import mongoose from "mongoose";

export const BOOKING_STATUSES = ["requested", "quoted", "confirmed", "in_progress", "awaiting_confirmation", "completed", "declined", "expired", "cancelled", "disputed"];
const changeSchema = new mongoose.Schema({
  price: { type: Number, required: true, min: 0 },
  scope: { type: String, required: true, maxlength: 4000 },
  scheduledAt: { type: Date, required: true },
  proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { _id: false });
const bookingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  artisanId: { type: mongoose.Schema.Types.ObjectId, ref: "Artisan", required: true },
  artisanOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, maxlength: 120 },
  description: { type: String, required: true, maxlength: 4000 },
  location: { type: String, required: true, maxlength: 500 },
  preferredAt: { type: Date, required: true },
  budget: { type: Number, min: 0, default: null },
  photos: [{ type: String }],
  status: { type: String, enum: BOOKING_STATUSES, default: "requested" },
  quote: { type: changeSchema, default: null },
  pendingChange: { type: changeSchema, default: null },
  completionNotes: { type: String, default: "", maxlength: 4000 },
  completionPhotos: [{ type: String }],
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 86400000) },
  review: { type: new mongoose.Schema({ rating: { type: Number, min: 1, max: 5 }, comment: { type: String, maxlength: 2000 }, createdAt: Date }, { _id: false }), default: null },
  history: [{
    action: String, status: String,
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    note: { type: String, maxlength: 4000 }, at: { type: Date, default: Date.now },
    terms: { type: changeSchema, default: null },
  }],
  messages: [{ senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, senderName: String, body: { type: String, maxlength: 2000 }, at: { type: Date, default: Date.now } }],
}, { timestamps: true });
bookingSchema.index({ customerId: 1, createdAt: -1 });
bookingSchema.index({ artisanOwnerId: 1, createdAt: -1 });
bookingSchema.index({ status: 1, expiresAt: 1 });
export default mongoose.model("Booking", bookingSchema);
