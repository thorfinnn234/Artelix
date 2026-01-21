import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  approveVendor,
  getVendorById,
  listVendors,
  getMyVendor,
  updateMyVendor,
  adminUpdateVendor,
  adminDeleteVendor,
  adminListVendors,
  rejectVendor,
  suspendVendor,
  unsuspendVendor,
} from "../controllers/vendor.controller.js";

const router = Router();

router.get("/", listVendors);

router.get("/me", auth, requireRole("vendor"), getMyVendor);
router.patch("/me", auth, requireRole("vendor"), updateMyVendor);

// admin list
router.get("/admin/all", auth, requireRole("admin"), adminListVendors);

// public details
router.get("/:id", getVendorById);

// admin actions
router.patch("/:id/approve", auth, requireRole("admin"), approveVendor);
router.patch("/:id", auth, requireRole("admin"), adminUpdateVendor);
router.delete("/:id", auth, requireRole("admin"), adminDeleteVendor);

router.patch("/:id/reject", auth, requireRole("admin"), rejectVendor);
router.patch("/:id/suspend", auth, requireRole("admin"), suspendVendor);
router.patch("/:id/unsuspend", auth, requireRole("admin"), unsuspendVendor);

export default router;
