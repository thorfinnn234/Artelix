import mongoose from "mongoose";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";

// ✅ GET /api/me/saved
export async function getSavedVendors(req, res) {
  const user = await User.findById(req.user._id).populate("savedVendorIds");
  res.json({ items: user.savedVendorIds || [] });
}

// ✅ POST /api/me/saved/:vendorId
export async function saveVendor(req, res) {
  const { vendorId } = req.params;

  if (!mongoose.isValidObjectId(vendorId)) {
    return res.status(400).json({ message: "Invalid vendor id" });
  }

  // Only approved vendors can be saved
  const vendor = await Vendor.findOne({ _id: vendorId, status: "approved" });
  if (!vendor) return res.status(404).json({ message: "Vendor not found" });

  // Add without duplicates
  await User.updateOne(
    { _id: req.user._id },
    { $addToSet: { savedVendorIds: vendorId } }
  );

  const updated = await User.findById(req.user._id).populate("savedVendorIds");

  res.json({
    message: "Vendor saved",
    items: updated.savedVendorIds,
  });
}

// ✅ DELETE /api/me/saved/:vendorId
export async function unsaveVendor(req, res) {
  const { vendorId } = req.params;

  if (!mongoose.isValidObjectId(vendorId)) {
    return res.status(400).json({ message: "Invalid vendor id" });
  }

  await User.updateOne(
    { _id: req.user._id },
    { $pull: { savedVendorIds: vendorId } }
  );

  const updated = await User.findById(req.user._id).populate("savedVendorIds");

  res.json({
    message: "Vendor unsaved",
    items: updated.savedVendorIds,
  });
}
