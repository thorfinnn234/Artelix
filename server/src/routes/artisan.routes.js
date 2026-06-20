import { Router } from "express";
import { auth, optionalAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { uploadArtisanWorkPhoto } from "../middleware/upload.js";
import {
  approveArtisan,
  getArtisanById,
  getArtisanWorks,
  listArtisan,
  getMyArtisan,
  updateMyArtisan,
  adminUpdateArtisan,
  adminDeleteArtisan,
  adminListArtisan,
  rejectArtisan,
  suspendArtisan,
  rateArtisan,
  unsuspendArtisan,
} from "../controllers/artisan.controller.js";
import {
  createMyWork,
  getMyWorks,
} from "../controllers/artisanWork.controller.js";

const router = Router();

router.get("/", optionalAuth, listArtisan);

router.get("/me", auth, requireRole("artisan"), getMyArtisan);
router.patch("/me", auth, requireRole("artisan"), updateMyArtisan);
router.get("/me/works", auth, requireRole("artisan"), getMyWorks);
router.post(
  "/me/works",
  auth,
  requireRole("artisan"),
  uploadArtisanWorkPhoto.single("photo"),
  createMyWork
);

// admin list
router.get("/admin/all", auth, requireRole("admin"), adminListArtisan);

// public details
router.get("/:id/works", getArtisanWorks);
router.post("/:id/rating", auth, rateArtisan);
router.get("/:id", optionalAuth, getArtisanById);

// admin actions
router.patch("/:id/approve", auth, requireRole("admin"), approveArtisan);
router.patch("/:id", auth, requireRole("admin"), adminUpdateArtisan);
router.delete("/:id", auth, requireRole("admin"), adminDeleteArtisan);

router.patch("/:id/reject", auth, requireRole("admin"), rejectArtisan);
router.patch("/:id/suspend", auth, requireRole("admin"), suspendArtisan);
router.patch("/:id/unsuspend", auth, requireRole("admin"), unsuspendArtisan);

export default router;
