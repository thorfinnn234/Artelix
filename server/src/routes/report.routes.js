import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { createReport, listMyReports, listReports, updateReport } from "../controllers/report.controller.js";

const router = Router();
router.post("/", auth, requireRole("user"), createReport);
router.get("/mine", auth, requireRole("user"), listMyReports);
router.get("/admin", auth, requireRole("admin"), listReports);
router.patch("/admin/:id", auth, requireRole("admin"), updateReport);
export default router;
