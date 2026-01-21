import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },

    rating: { type: Number, default: 0, min: 0, max: 5 },

    isSaved: { type: Boolean, default: false }, // (frontend demo field) - optional

    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
      moderationReason: { type: String, default: "" },

    },
  },
  { timestamps: true }
  
);

export default mongoose.model("Vendor", vendorSchema);

