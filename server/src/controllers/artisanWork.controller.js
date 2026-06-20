import mongoose from "mongoose";
import ArtisanWork from "../models/artisanWork.js";

function toWorkResponse(req, work) {
  const item = work.toObject ? work.toObject() : work;
  return {
    ...item,
    imageUrl: `${req.protocol}://${req.get("host")}${item.imageUrl}`,
  };
}

export async function getMyWorks(req, res) {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 50);

  if (!req.user.ArtisanId || !mongoose.isValidObjectId(req.user.ArtisanId)) {
    return res.status(404).json({ message: "No Artisan listing linked to this account." });
  }

  const filter = { ownerId: req.user._id, artisanId: req.user.ArtisanId };
  const [items, total] = await Promise.all([
    ArtisanWork.find(filter).sort({ createdAt: -1 }).limit(limit).lean(),
    ArtisanWork.countDocuments(filter),
  ]);

  res.json({
    total,
    items: items.map((work) => toWorkResponse(req, work)),
  });
}

export async function createMyWork(req, res) {
  const { title = "", category = "", description = "" } = req.body;

  if (!req.user.ArtisanId || !mongoose.isValidObjectId(req.user.ArtisanId)) {
    return res.status(404).json({ message: "No Artisan listing linked to this account." });
  }

  if (!title.trim() || !category.trim() || !description.trim()) {
    return res.status(400).json({ message: "Title, category, and description are required." });
  }

  if (!req.file) {
    return res.status(400).json({ message: "A work photo is required." });
  }

  const work = await ArtisanWork.create({
    artisanId: req.user.ArtisanId,
    ownerId: req.user._id,
    title: title.trim(),
    category: category.trim(),
    description: description.trim(),
    imageUrl: `/uploads/artisan-works/${req.file.filename}`,
  });

  res.status(201).json({
    message: "Work added",
    work: toWorkResponse(req, work),
  });
}
