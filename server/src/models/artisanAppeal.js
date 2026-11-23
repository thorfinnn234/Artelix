import mongoose from "mongoose";

const ArtisanAppealSchema = new mongoose.Schema(
  {
    ArtisanId: { type: mongoose.Schema.Types.ObjectId, ref: "Artisan", required: true, index: true },
    ArtisanOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    message: { type: String, required: true, trim: true, maxlength: 2000 },

    // Snapshot of the decision being appealed, so the history stays accurate
    // even after the listing's status or reason changes later.
    appealedStatus: { type: String, enum: ["suspended", "rejected"], default: null },
    appealedReason: { type: String, default: "", maxlength: 1000 },

    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending", index: true },

    adminNote: { type: String, default: "", maxlength: 2000 },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ArtisanAppealSchema.index({ ArtisanId: 1, createdAt: -1 });

export default mongoose.model("ArtisanAppeal", ArtisanAppealSchema);
