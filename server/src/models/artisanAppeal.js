import mongoose from "mongoose";

const ArtisanAppealSchema = new mongoose.Schema(
  {
    ArtisanId: { type: mongoose.Schema.Types.ObjectId, ref: "Artisan", required: true },
    ArtisanOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    message: { type: String, required: true, trim: true },

    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },

    adminNote: { type: String, default: "" },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("ArtisanAppeal", ArtisanAppealSchema);
