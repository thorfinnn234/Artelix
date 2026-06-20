import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { submitAppeal, adminListAppeals, resolveAppeal } from "../controllers/appeal.controller.js";

const router = Router();

// Artisan
router.post("/me/appeal", auth, requireRole("Artisan"), submitAppeal);

// Admin
router.get("/admin/appeals", auth, requireRole("admin"), adminListAppeals);
router.patch("/admin/appeals/:appealId/resolve", auth, requireRole("admin"), resolveAppeal);

export default router;
