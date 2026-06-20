import mongoose from "mongoose";

const artisanRatingSchema = new mongoose.Schema(
  {
    artisanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artisan",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

artisanRatingSchema.index({ artisanId: 1, userId: 1 }, { unique: true });

export default mongoose.model("ArtisanRating", artisanRatingSchema);
