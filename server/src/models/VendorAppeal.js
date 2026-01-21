import mongoose from "mongoose";

const vendorAppealSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    vendorOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    message: { type: String, required: true, trim: true },

    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },

    adminNote: { type: String, default: "" },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("VendorAppeal", vendorAppealSchema);
