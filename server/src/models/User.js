import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      area: { type: String, default: "", trim: true },
      city: { type: String, default: "", trim: true },
      state: { type: String, default: "", trim: true },
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    emailVerified: { type: Boolean, default: false },
    passwordHash: {
      type: String,
      required() {
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      default: null,
      index: true,
    },

    role: { type: String, enum: ["user", "artisan", "admin"], default: "user" },

    // For Artisan only (links the Artisan listing created on Register)
    ArtisanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artisan",
      default: null,
    },

    // Saved Artisan for normal users (and Artisan too if you want)
    savedArtisanIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artisan" }],

    passwordResetCodeHash: { type: String },
    passwordResetExpiresAt: { type: Date },
    passwordResetAttempts: { type: Number, default: 0 },
    passwordResetLastSentAt: { type: Date, default: null },

    isSuspended: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
    notificationPreferences: {
      emailUpdates: { type: Boolean, default: true },
      bookingMessages: { type: Boolean, default: true },
      savedArtisanUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
    },
  },
  
  { timestamps: true },
);
userSchema.index({ email: 1 });
export default mongoose.model("User", userSchema);
