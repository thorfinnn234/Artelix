import mongoose from "mongoose";
import User from "../models/User.js";
import Artisan from "../models/artisan.js";

// ✅ GET /api/me/saved
export async function getSavedArtisan(req, res) {
  const user = await User.findById(req.user._id).populate("savedArtisanIds");
  const items = (user?.savedArtisanIds || []).map((artisanDoc) => ({
    ...artisanDoc.toObject(),
    isSaved: true,
  }));

  res.json({ items });
}

// ✅ POST /api/me/saved/:ArtisanId
export async function saveArtisan(req, res) {
  const { ArtisanId } = req.params;

  if (!mongoose.isValidObjectId(ArtisanId)) {
    return res.status(400).json({ message: "Invalid Artisan id" });
  }

  // Only approved Artisan can be saved
  const artisanDoc = await Artisan.findOne({ _id: ArtisanId, status: "approved" });
  if (!artisanDoc) return res.status(404).json({ message: "Artisan not found" });

  // Add without duplicates
  await User.updateOne(
    { _id: req.user._id },
    { $addToSet: { savedArtisanIds: ArtisanId } }
  );

  const updated = await User.findById(req.user._id).populate("savedArtisanIds");
  const items = (updated?.savedArtisanIds || []).map((savedArtisan) => ({
    ...savedArtisan.toObject(),
    isSaved: true,
  }));

  res.json({
    message: "Artisan saved",
    items,
  });
}

// ✅ DELETE /api/me/saved/:ArtisanId
export async function unsaveArtisan(req, res) {
  const { ArtisanId } = req.params;

  if (!mongoose.isValidObjectId(ArtisanId)) {
    return res.status(400).json({ message: "Invalid Artisan id" });
  }

  await User.updateOne(
    { _id: req.user._id },
    { $pull: { savedArtisanIds: ArtisanId } }
  );

  const updated = await User.findById(req.user._id).populate("savedArtisanIds");
  const items = (updated?.savedArtisanIds || []).map((savedArtisan) => ({
    ...savedArtisan.toObject(),
    isSaved: true,
  }));

  res.json({
    message: "Artisan unsaved",
    items,
  });
}
