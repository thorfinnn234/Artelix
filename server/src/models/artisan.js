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

    // ✅ moved outside status
    moderationReason: { type: String, default: "" },
  },
  { timestamps: true },
);

// ✅ Add indexes for faster queries
Artisanchema.index({ status: 1 });
Artisanchema.index({ category: 1 });
Artisanchema.index({ name: "text" });

export default mongoose.model("Artisan", Artisanchema);
