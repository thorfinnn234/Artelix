import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controller.js";

const router = Router();

router.get("/", auth, listNotifications);
router.patch("/read-all", auth, markAllNotificationsRead);
router.patch("/:id/read", auth, markNotificationRead);

export default router;
