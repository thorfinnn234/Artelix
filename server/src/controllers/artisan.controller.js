import mongoose from "mongoose";
import Artisan from "../models/artisan.js";
import User from "../models/User.js";
import ArtisanWork from "../models/artisanWork.js";
import Notification from "../models/notification.js";
import { notifyUser } from "../services/notify.js";
import { listVerifiedReviews, verifiedReviewCount } from "../services/reviews.js";
import {
  cleanText,
  validateDetailedAddress,
  validateNigerianPhone,
} from "../utils/profileValidation.js";

function toAbsoluteWorkUrl(req, work) {
  return {
    ...work,
    imageUrl: `${req.protocol}://${req.get("host")}${work.imageUrl}`,
  };
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ✅ GET /api/Artisan (public list)
export async function listArtisan(req, res) {
  const {
    search = "",
    category = "",
    page = "1",
    limit = "12",
    sort = "newest",
    serviceArea = "",
    available = "",
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

  if (serviceArea.trim()) {
    const area = serviceArea.trim();
    if (area.length > 100) return res.status(400).json({ message: "Service area is too long." });
    filter.serviceAreas = { $regex: escapeRegex(area), $options: "i" };
  }

  if (available === "true") filter.isAvailable = true;
  if (available && !["true", "false"].includes(available)) {
    return res.status(400).json({ message: "Availability filter must be true or false." });
  }

  // Sorting
  let sortObj = { createdAt: -1 }; // newest
  if (sort === "rating_desc") sortObj = { rating: -1, createdAt: -1 };
  if (sort === "rating_asc") sortObj = { rating: 1, createdAt: -1 };
  if (sort === "oldest") sortObj = { createdAt: 1 };

  const skip = (pageNum - 1) * limitNum;

  const [items, total, categories, ratingStats] = await Promise.all([
    Artisan.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
    Artisan.countDocuments(filter),
    Artisan.distinct("category", filter),
    Artisan.aggregate([
      { $match: filter },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } },
    ]),
  ]);

  const totalPages = Math.ceil(total / limitNum) || 1;
  const savedIds = new Set(
    (req.user?.savedArtisanIds || []).map((id) => id.toString())
  );
  const itemsWithSavedState = items.map((item) => ({
    ...item,
    isSaved: savedIds.has(item._id.toString()),
  }));

  res.json({
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
    stats: {
      total,
      approved: total,
      categories: categories.length,
      averageRating: ratingStats[0]?.averageRating || 0,
    },
    items: itemsWithSavedState,
  });
}

// ✅ GET /api/Artisan/:id (public details)
export async function getArtisanById(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid Artisan id" });
  }

  const artisanDoc = await Artisan.findOne({ _id: id, status: "approved" }).lean();
  if (!artisanDoc) return res.status(404).json({ message: "Artisan not found" });

  const isSaved = (req.user?.savedArtisanIds || []).some(
    (savedId) => savedId.toString() === artisanDoc._id.toString()
  );
  const ratingCount = await verifiedReviewCount(artisanDoc._id);

  res.json({
    Artisan: {
      ...artisanDoc,
      isSaved,
      ratingCount,
    },
  });
}

// GET /api/artisan/:id/reviews (public, verified booking reviews only)
export async function getArtisanReviews(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid Artisan id" });
  }
  const exists = await Artisan.exists({ _id: id, status: "approved" });
  if (!exists) return res.status(404).json({ message: "Artisan not found" });
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 30);
  res.json(await listVerifiedReviews(id, { page, limit }));
}

const MODERATION_LINK = "/artisan/dashboard#appeal";

function moderationReason(req, res) {
  const reason = cleanText(req.body?.reason);
  if (reason.length < 5) {
    res.status(400).json({ message: "Give the artisan a clear reason (at least 5 characters)." });
    return null;
  }
  if (reason.length > 1000) {
    res.status(400).json({ message: "Reason cannot exceed 1,000 characters." });
    return null;
  }
  return reason;
}

export async function getArtisanWorks(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid Artisan id" });
  }

  const artisanDoc = await Artisan.findOne({ _id: id, status: "approved" }).lean();
  if (!artisanDoc) return res.status(404).json({ message: "Artisan not found" });

  const items = await ArtisanWork.find({ artisanId: id })
    .sort({ createdAt: -1 })
    .limit(24)
    .lean();

  res.json({ items: items.map((work) => toAbsoluteWorkUrl(req, work)) });
}

export async function rateArtisan(req, res) {
  return res.status(409).json({ message: "Leave a verified review from your completed booking.", link: "/user/bookings" });
}

export async function approveArtisan(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid Artisan id" });
  }

  const artisanDoc = await Artisan.findById(id);
  if (!artisanDoc) return res.status(404).json({ message: "Artisan not found" });

  artisanDoc.status = "approved";
  artisanDoc.moderationReason = "";
  await artisanDoc.save();
  await notifyUser({
    userId: artisanDoc.ownerId,
    type: "moderation",
    title: "Your listing is approved",
    message: `${artisanDoc.name} is now live and visible to customers.`,
    link: "/artisan/listing",
  });

  res.json({ message: "Artisan approved", Artisan: artisanDoc });
}

// ✅ Artisan: get my listing
export async function getMyArtisan(req, res) {
  // only Artisan role should reach here (via middleware)
  const ArtisanId = req.user.ArtisanId;

  if (!ArtisanId || !mongoose.isValidObjectId(ArtisanId)) {
    return res
      .status(404)
      .json({ message: "No Artisan listing linked to this account." });
  }

  const artisanDoc = await Artisan.findOne({ _id: ArtisanId, ownerId: req.user._id });
  if (!artisanDoc)
    return res.status(404).json({ message: "Artisan listing not found." });

  res.json({ Artisan: artisanDoc });
}

// ✅ Artisan: update my listing
export async function updateMyArtisan(req, res) {
  const ArtisanId = req.user.ArtisanId;

  if (!ArtisanId || !mongoose.isValidObjectId(ArtisanId)) {
    return res
      .status(404)
      .json({ message: "No Artisan listing linked to this account." });
  }

  // Allow only editable fields
  const allowed = ["name", "category", "phone", "address", "isAvailable", "serviceAreas"];
  const updates = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates[key] = key === "isAvailable"
        ? (req.body[key] === true || req.body[key] === "true")
        : cleanText(req.body[key]);
    }
  }

  if (req.body.serviceAreas !== undefined) {
    const areas = Array.isArray(req.body.serviceAreas) ? req.body.serviceAreas : String(req.body.serviceAreas).split(",");
    const normalized = [...new Set(areas.map(cleanText).filter(Boolean).map((area) => area.slice(0, 100)))];
    if (normalized.length > 10) return res.status(400).json({ message: "Add up to 10 service areas." });
    if (normalized.some((area) => area.length < 2)) return res.status(400).json({ message: "Each service area must be at least 2 characters." });
    updates.serviceAreas = normalized;
  }

  if (updates.phone !== undefined) {
    const phoneResult = validateNigerianPhone(updates.phone);
    if (!phoneResult.valid) {
      return res.status(400).json({ message: phoneResult.message });
    }
    updates.phone = phoneResult.value;
  }

  if (updates.address !== undefined) {
    const addressResult = validateDetailedAddress(updates.address);
    if (!addressResult.valid) {
      return res.status(400).json({ message: addressResult.message });
    }
    updates.address = addressResult.value;
  }

  // Optional: when Artisan edits, require re-approval
  // Uncomment if you want review after edits:
  // updates.status = "pending";

  const artisanDoc = await Artisan.findOneAndUpdate(
    { _id: ArtisanId, ownerId: req.user._id },
    { $set: updates },
    { new: true }
  );

  if (!artisanDoc)
    return res.status(404).json({ message: "Artisan listing not found." });

  res.json({ message: "Artisan listing updated", Artisan: artisanDoc });
}

export async function requestVerification(req, res) {
  const ArtisanId = req.user.ArtisanId;
  if (!ArtisanId || !mongoose.isValidObjectId(ArtisanId)) {
    return res.status(404).json({ message: "No artisan listing linked to this account." });
  }
  const account = await User.findById(req.user._id).select("isSuspended").lean();
  if (!account || account.isSuspended) return res.status(403).json({ message: "Your account is suspended." });
  const note = cleanText(req.body.note);
  if (note.length < 20 || note.length > 1000) {
    return res.status(400).json({ message: "Tell the review team about your qualifications in 20 to 1,000 characters." });
  }
  const artisan = await Artisan.findOne({ _id: ArtisanId, ownerId: req.user._id });
  if (!artisan) return res.status(404).json({ message: "Artisan listing not found." });
  if (artisan.verificationStatus === "verified") return res.status(409).json({ message: "Your listing is already verified." });
  if (artisan.verificationStatus === "pending") return res.status(409).json({ message: "Your verification request is already under review." });
  artisan.verificationStatus = "pending";
  artisan.verificationNote = note;
  artisan.verificationRequestedAt = new Date();
  artisan.verifiedAt = null;
  await artisan.save();
  res.status(201).json({ message: "Verification request submitted for review.", Artisan: artisan });
}

export async function reviewVerification(req, res) {
  const { id } = req.params;
  const { decision, note = "" } = req.body;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid artisan id." });
  if (!['verified', 'rejected'].includes(decision)) return res.status(400).json({ message: "Choose verified or rejected." });
  const reviewNote = cleanText(note);
  if (decision === "rejected" && reviewNote.length < 5) {
    return res.status(400).json({ message: "Add a clear reason when rejecting verification." });
  }
  if (reviewNote.length > 1000) return res.status(400).json({ message: "Review note cannot exceed 1,000 characters." });
  const artisan = await Artisan.findById(id);
  if (!artisan) return res.status(404).json({ message: "Artisan not found." });
  if (artisan.verificationStatus !== "pending") return res.status(409).json({ message: "This listing has no pending verification request." });
  artisan.verificationStatus = decision;
  artisan.verificationNote = reviewNote;
  artisan.verifiedAt = decision === "verified" ? new Date() : null;
  await artisan.save();
  try {
    await Notification.create({
      userId: artisan.ownerId,
      type: "artisan",
      title: decision === "verified" ? "Your listing is verified" : "Verification needs more information",
      message: decision === "verified" ? "Artelix has verified your artisan listing." : reviewNote,
      link: "/artisan/listing",
    });
  } catch (error) {
    console.error("Verification notification failed:", error.message);
  }
  res.json({ message: `Verification ${decision}.`, Artisan: artisan });
}

// ✅ Admin: update any Artisan
export async function adminUpdateArtisan(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: "Invalid Artisan id" });

  // Admin can update more fields (including status/rating if you want)
  const allowed = ["name", "category", "phone", "address", "rating", "status"];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  if (updates.phone !== undefined) {
    const phoneResult = validateNigerianPhone(updates.phone);
    if (!phoneResult.valid) {
      return res.status(400).json({ message: phoneResult.message });
    }
    updates.phone = phoneResult.value;
  }

  if (updates.address !== undefined) {
    const addressResult = validateDetailedAddress(updates.address);
    if (!addressResult.valid) {
      return res.status(400).json({ message: addressResult.message });
    }
    updates.address = addressResult.value;
  }

  const artisanDoc = await Artisan.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  );
  if (!artisanDoc) return res.status(404).json({ message: "Artisan not found" });

  res.json({ message: "Artisan updated", Artisan: artisanDoc });
}

// ✅ Admin: delete any Artisan
export async function adminDeleteArtisan(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: "Invalid Artisan id" });

  const artisanDoc = await Artisan.findByIdAndDelete(id);
  if (!artisanDoc) return res.status(404).json({ message: "Artisan not found" });

  res.json({ message: "Artisan deleted" });
}
export async function adminListArtisan(req, res) {
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
    Artisan.find(filter).sort(sortObj).skip(skip).limit(limitNum),
    Artisan.countDocuments(filter),
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
 

// Admin: reject Artisan (usually from pending)
export async function rejectArtisan(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid Artisan id" });
  }
  const reason = moderationReason(req, res);
  if (!reason) return;

  const artisanDoc = await Artisan.findById(id);
  if (!artisanDoc) return res.status(404).json({ message: "Artisan not found" });

  artisanDoc.status = "rejected";
  artisanDoc.moderationReason = reason;
  await artisanDoc.save();
  await notifyUser({
    userId: artisanDoc.ownerId,
    type: "moderation",
    title: "Your listing was not approved",
    message: `Reason: ${reason} You can update your listing and submit an appeal.`,
    link: MODERATION_LINK,
  });

  res.json({ message: "Artisan rejected", Artisan: artisanDoc });
}

// Admin: suspend Artisan
export async function suspendArtisan(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid Artisan id" });
  }
  const reason = moderationReason(req, res);
  if (!reason) return;

  const artisanDoc = await Artisan.findById(id);
  if (!artisanDoc) return res.status(404).json({ message: "Artisan not found" });

  artisanDoc.status = "suspended";
  artisanDoc.moderationReason = reason;
  await artisanDoc.save();
  await notifyUser({
    userId: artisanDoc.ownerId,
    type: "moderation",
    title: "Your listing has been suspended",
    message: `Reason: ${reason} You can submit an appeal from your dashboard.`,
    link: MODERATION_LINK,
  });

  res.json({ message: "Artisan suspended", Artisan: artisanDoc });
}

// Admin: unsuspend Artisan (back to approved)
export async function unsuspendArtisan(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid Artisan id" });
  }

  const artisanDoc = await Artisan.findById(id);
  if (!artisanDoc) return res.status(404).json({ message: "Artisan not found" });

  artisanDoc.status = "approved";
  artisanDoc.moderationReason = "";
  await artisanDoc.save();
  await notifyUser({
    userId: artisanDoc.ownerId,
    type: "moderation",
    title: "Your listing has been restored",
    message: `${artisanDoc.name} is visible to customers again.`,
    link: "/artisan/listing",
  });

  res.json({ message: "Artisan unsuspended", Artisan: artisanDoc });
}
