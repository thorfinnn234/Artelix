import mongoose from "mongoose";
import Vendor from "../models/Vendor.js";
import VendorAppeal from "../models/VendorAppeal.js";

// Vendor submits appeal
export async function submitAppeal(req, res) {
  const vendorId = req.user.vendorId;

  if (!vendorId || !mongoose.isValidObjectId(vendorId)) {
    return res.status(404).json({ message: "No vendor listing linked to this account." });
  }

  const { message = "" } = req.body;
  if (!message.trim()) {
    return res.status(400).json({ message: "Appeal message is required." });
  }

  const vendor = await Vendor.findOne({ _id: vendorId, ownerId: req.user._id });
  if (!vendor) return res.status(404).json({ message: "Vendor listing not found." });

  // Optional rule: only allow appeals when suspended/rejected
  if (!["suspended", "rejected"].includes(vendor.status)) {
    return res.status(400).json({ message: "You can only appeal when your listing is suspended or rejected." });
  }

  // Avoid spam: allow only one pending appeal at a time
  const existingPending = await VendorAppeal.findOne({ vendorId, status: "pending" });
  if (existingPending) {
    return res.status(409).json({ message: "You already have a pending appeal." });
  }

  const appeal = await VendorAppeal.create({
    vendorId,
    vendorOwnerId: req.user._id,
    message: message.trim(),
  });

  res.status(201).json({ message: "Appeal submitted", appeal });
}

// Admin lists appeals
export async function adminListAppeals(req, res) {
  const { status = "pending", page = "1", limit = "12" } = req.query;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (status) filter.status = status;

  const [items, total] = await Promise.all([
    VendorAppeal.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("vendorId")
      .populate("vendorOwnerId", "fullName email role"),
    VendorAppeal.countDocuments(filter),
  ]);

  res.json({
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
    items,
  });
}

// Admin resolves appeal (accept/reject)
export async function resolveAppeal(req, res) {
  const { appealId } = req.params;

  if (!mongoose.isValidObjectId(appealId)) {
    return res.status(400).json({ message: "Invalid appeal id" });
  }

  const { decision, adminNote = "" } = req.body;

  if (!["accept", "reject"].includes(decision)) {
    return res.status(400).json({ message: "decision must be 'accept' or 'reject'" });
  }

  const appeal = await VendorAppeal.findById(appealId);
  if (!appeal) return res.status(404).json({ message: "Appeal not found" });

  if (appeal.status !== "pending") {
    return res.status(409).json({ message: "Appeal already resolved" });
  }

  // Update appeal
  appeal.status = decision === "accept" ? "accepted" : "rejected";
  appeal.adminNote = adminNote;
  appeal.resolvedAt = new Date();
  await appeal.save();

  // If accepted → unsuspend/approve vendor
  if (decision === "accept") {
    await Vendor.updateOne(
      { _id: appeal.vendorId },
      { $set: { status: "approved", moderationReason: "" } }
    );
  }

  const updated = await VendorAppeal.findById(appealId)
    .populate("vendorId")
    .populate("vendorOwnerId", "fullName email role");

  res.json({ message: "Appeal resolved", appeal: updated });
}
