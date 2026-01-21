import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    passwordHash: { type: String, required: true },

    role: { type: String, enum: ["user", "vendor", "admin"], default: "user" },

    // For vendors only (links the vendor listing created on signup)
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },

    // Saved vendors for normal users (and vendors too if you want)
    savedVendorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }],

    passwordResetCodeHash: { type: String },
    passwordResetExpiresAt: { type: Date },
    passwordResetAttempts: { type: Number, default: 0 },
    passwordResetLastSentAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
