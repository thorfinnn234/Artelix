import mongoose from "mongoose";

const Artisanchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    isSaved: { type: Boolean, default: false },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      address: { type: String, default: "" },
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },

    // Availability and service coverage are set by the artisan and drive
    // marketplace discovery. They are separate from moderation status.
    isAvailable: { type: Boolean, default: true },
    serviceAreas: [{ type: String, trim: true, maxlength: 100 }],

    // "verified" means an Artelix administrator has reviewed the artisan's
    // verification request. It does not replace listing approval.
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
    },
    verificationNote: { type: String, default: "", maxlength: 1000 },
    verificationRequestedAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },

    // ✅ moved outside status
    moderationReason: { type: String, default: "" },
  },
  { timestamps: true },
);

// ✅ Add indexes for faster queries
Artisanchema.index({ status: 1 });
Artisanchema.index({ category: 1 });
Artisanchema.index({ name: "text" });
Artisanchema.index({ status: 1, isAvailable: 1 });
Artisanchema.index({ serviceAreas: 1 });

export default mongoose.model("Artisan", Artisanchema);
