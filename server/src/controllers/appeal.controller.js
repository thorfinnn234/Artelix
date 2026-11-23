import mongoose from "mongoose";
import Artisan from "../models/artisan.js";
import ArtisanAppeal from "../models/artisanAppeal.js";
import { notifyAdmins, notifyUser } from "../services/notify.js";

const APPEAL_STATUSES = ["pending", "accepted", "rejected"];
const APPEALABLE = ["suspended", "rejected"];

function linkedListingId(req, res) {
  const ArtisanId = req.user.ArtisanId;
  if (!ArtisanId || !mongoose.isValidObjectId(ArtisanId)) {
    res.status(404).json({ message: "No Artisan listing linked to this account." });
    return null;
  }
  return ArtisanId;
}

// POST /api/artisan/me/appeal (artisan submits an appeal)
export async function submitAppeal(req, res) {
  const ArtisanId = linkedListingId(req, res);
  if (!ArtisanId) return;

  const message = String(req.body?.message || "").trim();
  if (message.length < 20 || message.length > 2000) {
    return res.status(400).json({ message: "Explain your appeal in 20 to 2,000 characters." });
  }

  const listing = await Artisan.findOne({ _id: ArtisanId, ownerId: req.user._id });
  if (!listing) return res.status(404).json({ message: "Artisan listing not found." });

  if (!APPEALABLE.includes(listing.status)) {
    return res.status(400).json({ message: "You can only appeal when your listing is suspended or rejected." });
  }

  // Only one pending appeal at a time.
  const existingPending = await ArtisanAppeal.findOne({ ArtisanId, status: "pending" });
  if (existingPending) {
    return res.status(409).json({ message: "You already have a pending appeal. We will notify you when it is reviewed." });
  }

  const appeal = await ArtisanAppeal.create({
    ArtisanId,
    ArtisanOwnerId: req.user._id,
    message,
    appealedStatus: listing.status,
    appealedReason: listing.moderationReason || "",
  });

  await notifyAdmins({
    type: "appeal",
    title: "New artisan appeal",
    message: `${listing.name} appealed their ${listing.status} listing.`,
    link: "/admin/appeals",
  });

  res.status(201).json({ message: "Appeal submitted", appeal });
}

// GET /api/artisan/me/appeals (artisan's moderation status and appeal history)
export async function listMyAppeals(req, res) {
  const ArtisanId = linkedListingId(req, res);
  if (!ArtisanId) return;

  const listing = await Artisan.findOne({ _id: ArtisanId, ownerId: req.user._id })
    .select("name status moderationReason updatedAt").lean();
  if (!listing) return res.status(404).json({ message: "Artisan listing not found." });

  const appeals = await ArtisanAppeal.find({ ArtisanId }).sort({ createdAt: -1 }).limit(20).lean();
  const hasPending = appeals.some((appeal) => appeal.status === "pending");

  res.json({
    listing,
    appeals,
    canAppeal: APPEALABLE.includes(listing.status) && !hasPending,
  });
}

// GET /api/artisan/admin/appeals (admin lists appeals)
export async function adminListAppeals(req, res) {
  const { status = "pending", page = "1", limit = "12" } = req.query;
  if (status && !APPEAL_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid appeal status." });
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);
  const skip = (pageNum - 1) * limitNum;

  const filter = status ? { status } : {};

  const [items, total, pendingCount] = await Promise.all([
    ArtisanAppeal.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("ArtisanId", "name category status moderationReason phone address")
      .populate("ArtisanOwnerId", "fullName email")
      .populate("resolvedBy", "fullName"),
    ArtisanAppeal.countDocuments(filter),
    ArtisanAppeal.countDocuments({ status: "pending" }),
  ]);

  res.json({
    page: pageNum,
    limit: limitNum,
    total,
    pendingCount,
    totalPages: Math.ceil(total / limitNum) || 1,
    items,
  });
}

// PATCH /api/artisan/admin/appeals/:appealId/resolve (admin accepts or rejects)
export async function resolveAppeal(req, res) {
  const { appealId } = req.params;

  if (!mongoose.isValidObjectId(appealId)) {
    return res.status(400).json({ message: "Invalid appeal id" });
  }

  const { decision } = req.body || {};
  const adminNote = String(req.body?.adminNote || "").trim();

  if (!["accept", "reject"].includes(decision)) {
    return res.status(400).json({ message: "decision must be 'accept' or 'reject'" });
  }
  if (decision === "reject" && adminNote.length < 5) {
    return res.status(400).json({ message: "Explain why the appeal was rejected (at least 5 characters)." });
  }
  if (adminNote.length > 2000) {
    return res.status(400).json({ message: "Admin note cannot exceed 2,000 characters." });
  }

  // Conditional update so two admins cannot resolve the same appeal twice.
  const appeal = await ArtisanAppeal.findOneAndUpdate(
    { _id: appealId, status: "pending" },
    {
      $set: {
        status: decision === "accept" ? "accepted" : "rejected",
        adminNote,
        resolvedBy: req.user._id,
        resolvedAt: new Date(),
      },
    },
    { new: true }
  );
  if (!appeal) {
    const exists = await ArtisanAppeal.exists({ _id: appealId });
    return exists
      ? res.status(409).json({ message: "Appeal already resolved" })
      : res.status(404).json({ message: "Appeal not found" });
  }

  const listing = await Artisan.findById(appeal.ArtisanId).select("name status");
  if (decision === "accept") {
    await Artisan.updateOne(
      { _id: appeal.ArtisanId, status: { $in: APPEALABLE } },
      { $set: { status: "approved", moderationReason: "" } }
    );
  }

  await notifyUser({
    userId: appeal.ArtisanOwnerId,
    type: "appeal",
    title: decision === "accept" ? "Your appeal was accepted" : "Your appeal was not accepted",
    message: decision === "accept"
      ? `${listing?.name || "Your listing"} has been restored and is visible to customers.${adminNote ? ` Note: ${adminNote}` : ""}`
      : `Your listing remains ${listing?.status || appeal.appealedStatus}. Reason: ${adminNote}`,
    link: "/artisan/dashboard#appeal",
  });

  const updated = await ArtisanAppeal.findById(appealId)
    .populate("ArtisanId", "name category status moderationReason phone address")
    .populate("ArtisanOwnerId", "fullName email")
    .populate("resolvedBy", "fullName");

  res.json({ message: "Appeal resolved", appeal: updated });
}
