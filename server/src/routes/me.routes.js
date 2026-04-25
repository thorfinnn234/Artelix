import { Router } from "express";
import { auth } from "../middleware/auth.js";
import User from "../models/User.js"; // ← add this

const router = Router();

router.get("/", auth, (req, res) => {
  res.json({ user: req.user });
});

router.patch("/", auth, async (req, res) => {
  try {
    const { fullName, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, avatar },
      { new: true },
    ).select("-passwordHash");
    res.json({ user });
  } catch (err) {
    console.error("Update error:", err.message);
    res.status(500).json({ message: "Update failed" });
    router.patch("/", auth, async (req, res) => {
      try {
        console.log("PATCH /me hit"); // ← add this
        console.log("User from token:", req.user?._id); // ← add this
        console.log("Body:", req.body); // ← add this

        const { fullName, avatar } = req.body;
        const user = await User.findByIdAndUpdate(
          req.user._id,
          { fullName, avatar },
          { new: true },
        ).select("-passwordHash");
        res.json({ user });
      } catch (err) {
        console.error("Update error:", err.message);
        res.status(500).json({ message: "Update failed" });
      }
    }); 
  }
});

export default router;
