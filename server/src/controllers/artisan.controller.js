import mongoose from "mongoose";
import Artisan from "../models/artisan.js";
import ArtisanRating from "../models/artisanRating.js";
import ArtisanWork from "../models/artisanWork.js";
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

// ✅ GET /api/Artisan (public list)
export async function listArtisan(req, res) {
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
  const [ratingCount, myRating] = await Promise.all([
    ArtisanRating.countDocuments({ artisanId: artisanDoc._id }),
    req.user
      ? ArtisanRating.findOne({ artisanId: artisanDoc._id, userId: req.user._id }).lean()
      : null,
  ]);

  res.json({
    Artisan: {
      ...artisanDoc,
      isSaved,
      ratingCount,
      myRating: myRating?.rating || 0,
    },
  });
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
  const { id } = req.params;
  const rating = Number(req.body.rating);

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid Artisan id" });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be a number from 1 to 5." });
  }

  const artisanDoc = await Artisan.findOne({ _id: id, status: "approved" });
  if (!artisanDoc) return res.status(404).json({ message: "Artisan not found" });

  await ArtisanRating.findOneAndUpdate(
    { artisanId: id, userId: req.user._id },
    { $set: { rating } },
    { upsert: true, new: true, runValidators: true }
  );

  const stats = await ArtisanRating.aggregate([
    { $match: { artisanId: artisanDoc._id } },
    {
      $group: {
        _id: "$artisanId",
        averageRating: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);
  const nextRating = stats[0]?.averageRating || 0;
  const ratingCount = stats[0]?.ratingCount || 0;

  artisanDoc.rating = Number(nextRating.toFixed(1));
  await artisanDoc.save();

  res.json({
    message: "Rating saved",
    rating: artisanDoc.rating,
    ratingCount,
    myRating: rating,
  });
}

// ✅ PATCH /api/Artisan/:id/approve (admin only)
export async function approveArtisan(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid Artisan id" });
  }

  const artisanDoc = await Artisan.findById(id);
  if (!artisanDoc) return res.status(404).json({ message: "Artisan not found" });

  artisanDoc.status = "approved";
  await artisanDoc.save();

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
  const allowed = ["name", "category", "phone", "address"];
  const updates = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = cleanText(req.body[key]);
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
  const { reason = "" } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid Artisan id" });
  }

  const artisanDoc = await Artisan.findById(id);
  if (!artisanDoc) return res.status(404).json({ message: "Artisan not found" });

  artisanDoc.status = "rejected";
  // Optional: store reason (needs schema field, see note below)
  if (reason) artisanDoc.moderationReason = reason;

  await artisanDoc.save();

  res.json({ message: "Artisan rejected", Artisan: artisanDoc });
}

// Admin: suspend Artisan
export async function suspendArtisan(req, res) {
  const { id } = req.params;
  const { reason = "" } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid Artisan id" });
  }

  const artisanDoc = await Artisan.findById(id);
  if (!artisanDoc) return res.status(404).json({ message: "Artisan not found" });

  artisanDoc.status = "suspended";
  if (reason) artisanDoc.moderationReason = reason;

  await artisanDoc.save();

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
  artisanDoc.moderationReason = ""; // clear reason after unsuspending (optional)

  await artisanDoc.save();

  res.json({ message: "Artisan unsuspended", Artisan: artisanDoc });
}
