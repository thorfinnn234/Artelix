import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { Register, login } from "../controllers/auth.controller.js";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/password.controller.js";

const router = Router();

router.post("/register", Register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, async (err, user) => {
    if (err || !user) {
      console.error("Google callback error:", err); // ← log the error
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=google_failed`,
      );
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    console.log("Google login success, token generated for:", user.email);
    res.redirect(
      `${process.env.CLIENT_URL}/auth/google/success?token=${token}`,
    );
  })(req, res, next);
});

export default router;
