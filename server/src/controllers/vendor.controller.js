import mongoose from "mongoose";
import Vendor from "../models/Vendor.js";

// ✅ GET /api/vendors (public list)
export async function listVendors(req, res) {
  const {
    search = "",
    category = "",
    page = "1",
    limit = "12",
    sort = "newest",
  } = req.query;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);

  // Base filter: only approved for public marketplace
  const filter = { status: "approved" };

  // Search by name
  if (search.trim()) {
    filter.name = { $regex: search.trim(), $options: "i" };
  }

  // Filter by category
  if (category.trim()) {
    filter.category = category.trim();
  }

  // Sorting
  let sortObj = { createdAt: -1 }; // newest
  if (sort === "rating_desc") sortObj = { rating: -1, createdAt: -1 };
  if (sort === "rating_asc") sortObj = { rating: 1, createdAt: -1 };
  if (sort === "oldest") sortObj = { createdAt: 1 };

  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Vendor.find(filter).sort(sortObj).skip(skip).limit(limitNum),
    Vendor.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum) || 1;

  res.json({
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
    items,
  });
}

// ✅ GET /api/vendors/:id (public details)
export async function getVendorById(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid vendor id" });
  }

  const vendor = await Vendor.findOne({ _id: id, status: "approved" });
  if (!vendor) return res.status(404).json({ message: "Vendor not found" });

  res.json({ vendor });
}

// ✅ PATCH /api/vendors/:id/approve (admin only)
export async function approveVendor(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid vendor id" });
  }

  const vendor = await Vendor.findById(id);
  if (!vendor) return res.status(404).json({ message: "Vendor not found" });

  vendor.status = "approved";
  await vendor.save();

  res.json({ message: "Vendor approved", vendor });
}

// ✅ Vendor: get my listing
export async function getMyVendor(req, res) {
  // only vendor role should reach here (via middleware)
  const vendorId = req.user.vendorId;

  if (!vendorId || !mongoose.isValidObjectId(vendorId)) {
    return res
      .status(404)
      .json({ message: "No vendor listing linked to this account." });
  }

  const vendor = await Vendor.findOne({ _id: vendorId, ownerId: req.user._id });
  if (!vendor)
    return res.status(404).json({ message: "Vendor listing not found." });

  res.json({ vendor });
}

// ✅ Vendor: update my listing
export async function updateMyVendor(req, res) {
  const vendorId = req.user.vendorId;

  if (!vendorId || !mongoose.isValidObjectId(vendorId)) {
    return res
      .status(404)
      .json({ message: "No vendor listing linked to this account." });
  }

  // Allow only editable fields
  const allowed = ["name", "category", "phone", "address"];
  const updates = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  // Optional: when vendor edits, require re-approval
  // Uncomment if you want review after edits:
  // updates.status = "pending";

  const vendor = await Vendor.findOneAndUpdate(
    { _id: vendorId, ownerId: req.user._id },
    { $set: updates },
    { new: true }
  );

  if (!vendor)
    return res.status(404).json({ message: "Vendor listing not found." });

  res.json({ message: "Vendor listing updated", vendor });
}

// ✅ Admin: update any vendor
export async function adminUpdateVendor(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: "Invalid vendor id" });

  // Admin can update more fields (including status/rating if you want)
  const allowed = ["name", "category", "phone", "address", "rating", "status"];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const vendor = await Vendor.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  );
  if (!vendor) return res.status(404).json({ message: "Vendor not found" });

  res.json({ message: "Vendor updated", vendor });
}

// ✅ Admin: delete any vendor
export async function adminDeleteVendor(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: "Invalid vendor id" });

  const vendor = await Vendor.findByIdAndDelete(id);
  if (!vendor) return res.status(404).json({ message: "Vendor not found" });

  res.json({ message: "Vendor deleted" });
}
export async function adminListVendors(req, res) {
  const {
    search = "",
    category = "",
    status = "",       // pending | approved | rejected | suspended
    page = "1",
    limit = "12",
    sort = "newest",
  } = req.query;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);

  const filter = {};

  if (search.trim()) {
    filter.name = { $regex: search.trim(), $options: "i" };
  }

  if (category.trim()) {
    filter.category = category.trim();
  }

  if (status.trim()) {
    filter.status = status.trim();
  }

  let sortObj = { createdAt: -1 };
  if (sort === "rating_desc") sortObj = { rating: -1, createdAt: -1 };
  if (sort === "rating_asc") sortObj = { rating: 1, createdAt: -1 };
  if (sort === "oldest") sortObj = { createdAt: 1 };

  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Vendor.find(filter).sort(sortObj).skip(skip).limit(limitNum),
    Vendor.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum) || 1;

  res.json({
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
    items,
  });
}
 

// Admin: reject vendor (usually from pending)
export async function rejectVendor(req, res) {
  const { id } = req.params;
  const { reason = "" } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid vendor id" });
  }

  const vendor = await Vendor.findById(id);
  if (!vendor) return res.status(404).json({ message: "Vendor not found" });

  vendor.status = "rejected";
  // Optional: store reason (needs schema field, see note below)
  if (reason) vendor.moderationReason = reason;

  await vendor.save();

  res.json({ message: "Vendor rejected", vendor });
}

// Admin: suspend vendor
export async function suspendVendor(req, res) {
  const { id } = req.params;
  const { reason = "" } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid vendor id" });
  }

  const vendor = await Vendor.findById(id);
  if (!vendor) return res.status(404).json({ message: "Vendor not found" });

  vendor.status = "suspended";
  if (reason) vendor.moderationReason = reason;

  await vendor.save();

  res.json({ message: "Vendor suspended", vendor });
}

// Admin: unsuspend vendor (back to approved)
export async function unsuspendVendor(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid vendor id" });
  }

  const vendor = await Vendor.findById(id);
  if (!vendor) return res.status(404).json({ message: "Vendor not found" });

  vendor.status = "approved";
  vendor.moderationReason = ""; // clear reason after unsuspending (optional)

  await vendor.save();

  res.json({ message: "Vendor unsuspended", vendor });
}
