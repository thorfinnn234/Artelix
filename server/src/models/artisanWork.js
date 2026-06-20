import mongoose from "mongoose";

const artisanWorkSchema = new mongoose.Schema(
  {
    artisanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artisan",
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("ArtisanWork", artisanWorkSchema);
