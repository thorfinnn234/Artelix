import fs from "fs";
import path from "path";
import multer from "multer";

const uploadRoot = path.resolve("uploads");
const artisanWorksDir = path.join(uploadRoot, "artisan-works");

fs.mkdirSync(artisanWorksDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, artisanWorksDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) return cb(null, true);
  cb(new Error("Only image uploads are allowed"));
};

export const uploadArtisanWorkPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
