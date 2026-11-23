import mongoose from "mongoose";

export const MISCONDUCT_CATEGORIES = ["safety", "fraud", "harassment", "poor_service", "other"];
export const SUPPORT_CATEGORIES = ["account", "booking", "payment", "technical", "listing", "other"];

const reportSchema = new mongoose.Schema(
  {
    // "misconduct": a customer reports an artisan listing.
    // "support":    any customer or artisan asks the Artelix team for help.
    kind: { type: String, enum: ["misconduct", "support"], default: "misconduct", index: true },
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reporterRole: { type: String, enum: ["user", "artisan"], default: "user" },
    artisanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artisan",
      index: true,
      default: null,
      required() { return this.kind === "misconduct"; },
    },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    category: {
      type: String,
      enum: [...new Set([...MISCONDUCT_CATEGORIES, ...SUPPORT_CATEGORIES])],
      required: true,
    },
    subject: { type: String, default: "", trim: true, maxlength: 120 },
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
