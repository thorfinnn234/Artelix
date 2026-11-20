import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    artisanId: { type: mongoose.Schema.Types.ObjectId, ref: "Artisan", required: true, index: true },
    category: {
      type: String,
      enum: ["safety", "fraud", "harassment", "poor_service", "other"],
      required: true,
    },
    details: { type: String, required: true, trim: true, maxlength: 4000 },
    status: {
      type: String,
      enum: ["open", "reviewing", "resolved", "dismissed"],
      default: "open",
      index: true,
    },
    resolutionNote: { type: String, default: "", trim: true, maxlength: 4000 },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

reportSchema.index({ reporterId: 1, artisanId: 1, status: 1 });
reportSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Report", reportSchema);
