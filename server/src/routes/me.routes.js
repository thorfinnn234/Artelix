import { Router } from "express";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
