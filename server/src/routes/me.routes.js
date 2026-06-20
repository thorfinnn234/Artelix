import { Router } from "express";
import { auth, clearUserCache } from "../middleware/auth.js";
import User from "../models/User.js";
import {
  validateNigerianPhone,
  validateUserLocation,
} from "../utils/profileValidation.js";

const router = Router();

function serializeUser(user) {
  return {
    id:                      user._id,
    fullName:                user.fullName,
    email:                   user.email,
    role:                    user.role,
    artisanId:               user.ArtisanId,
    avatar:                  user.avatar,
    phone:                   user.phone,
    location:                user.location,
    emailVerified:           user.emailVerified,
    googleConnected:         Boolean(user.googleId),
    isSuspended:             user.isSuspended,
    lastLoginAt:             user.lastLoginAt,
    notificationPreferences: user.notificationPreferences,
    savedArtisanCount:       user.savedArtisanIds?.length ?? 0,
    createdAt:               user.createdAt,
    updatedAt:               user.updatedAt,
  };
}

router.get("/", auth, (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

router.patch("/", auth, async (req, res) => {
  try {
    const updates = {};
    const { fullName, avatar, phone, location, notificationPreferences } = req.body;

    if (typeof fullName === "string") updates.fullName = fullName.trim();
    if (typeof avatar === "string" || avatar === null) updates.avatar = avatar;
    if (typeof phone === "string") {
      const phoneResult = validateNigerianPhone(phone);
      if (!phoneResult.valid) {
        return res.status(400).json({ message: phoneResult.message });
      }
      updates.phone = phoneResult.value;
    }

    if (location && typeof location === "object") {
      const locationResult = validateUserLocation(location);
      if (!locationResult.valid) {
        return res.status(400).json({ message: locationResult.message });
      }
      updates.location = locationResult.value;
    }

    if (notificationPreferences && typeof notificationPreferences === "object") {
      updates.notificationPreferences = {
        emailUpdates:        Boolean(notificationPreferences.emailUpdates),
        bookingMessages:     Boolean(notificationPreferences.bookingMessages),
        savedArtisanUpdates: Boolean(notificationPreferences.savedArtisanUpdates),
        promotions:          Boolean(notificationPreferences.promotions),
      };
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    clearUserCache(req.user._id);
    res.json({ user: serializeUser(user) });
  } catch (err) {
    console.error("Update error:", err.message);
    res.status(500).json({ message: "Update failed" });
  }
});

export default router;
