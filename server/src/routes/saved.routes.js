import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getSavedVendors, saveVendor, unsaveVendor } from "../controllers/saved.controller.js";

const router = Router();

router.get("/", auth, getSavedVendors);
router.post("/:vendorId", auth, saveVendor);
router.delete("/:vendorId", auth, unsaveVendor);

export default router;
