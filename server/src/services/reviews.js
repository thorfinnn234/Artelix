import mongoose from "mongoose";
import Booking from "../models/booking.js";

const verifiedFilter = (artisanId) => ({
  artisanId: new mongoose.Types.ObjectId(String(artisanId)),
  status: "completed",
  review: { $ne: null },
});

// Average of reviews left on completed bookings, rounded to one decimal place.
export async function verifiedRating(artisanId, session = null) {
  const query = Booking.aggregate([
    { $match: verifiedFilter(artisanId) },
    { $group: { _id: null, average: { $avg: "$review.rating" } } },
  ]);
  if (session) query.session(session);
  const [stats] = await query;
  return Number((stats?.average || 0).toFixed(1));
}

export async function verifiedReviewCount(artisanId) {
  return Booking.countDocuments(verifiedFilter(artisanId));
}

// Public review feed. Only the reviewer's first name is exposed.
export async function listVerifiedReviews(artisanId, { page = 1, limit = 10 } = {}) {
  const filter = verifiedFilter(artisanId);
  const [items, total, breakdown] = await Promise.all([
    Booking.find(filter)
      .select("title review customerId updatedAt")
      .populate("customerId", "fullName avatar")
      .sort({ "review.createdAt": -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Booking.countDocuments(filter),
    Booking.aggregate([{ $match: filter }, { $group: { _id: "$review.rating", count: { $sum: 1 } } }]),
  ]);
  return {
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    breakdown: Object.fromEntries([5, 4, 3, 2, 1].map((star) => [star, breakdown.find((row) => row._id === star)?.count || 0])),
    items: items.map((booking) => ({
      _id: booking._id,
      jobTitle: booking.title,
      rating: booking.review.rating,
      comment: booking.review.comment || "",
      createdAt: booking.review.createdAt || booking.updatedAt,
      reviewer: {
        name: String(booking.customerId?.fullName || "Artelix customer").trim().split(/\s+/)[0],
        avatar: booking.customerId?.avatar || null,
      },
    })),
  };
}
