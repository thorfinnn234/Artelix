import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { submitAppeal, listMyAppeals, adminListAppeals, resolveAppeal } from "../controllers/appeal.controller.js";

const router = Router();

// Artisan
router.get("/me/appeals", auth, requireRole("artisan"), listMyAppeals);
router.post("/me/appeal", auth, requireRole("artisan"), submitAppeal);

// Admin
router.get("/admin/appeals", auth, requireRole("admin"), adminListAppeals);
router.patch("/admin/appeals/:appealId/resolve", auth, requireRole("admin"), resolveAppeal);

export default router;
