import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getSavedArtisan, saveArtisan, unsaveArtisan } from "../controllers/saved.controller.js";

const router = Router();

router.get("/", auth, getSavedArtisan);
router.post("/:ArtisanId", auth, saveArtisan);
router.delete("/:ArtisanId", auth, unsaveArtisan);

export default router;
