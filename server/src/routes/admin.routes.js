import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  getStats,
  listUsers,
  deleteUser,
  suspendUser,
  unsuspendUser,
} from "../controllers/admin.controller.js";

const router = Router();

router.get("/stats", auth, requireRole("admin"), getStats);
router.get("/users",  auth, requireRole("admin"), listUsers);
router.delete("/users/:id", auth, requireRole("admin"), deleteUser);
router.patch("/users/:id/suspend",   auth, requireRole("admin"), suspendUser);
router.patch("/users/:id/unsuspend", auth, requireRole("admin"), unsuspendUser);

export default router;