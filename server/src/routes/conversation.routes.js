import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  getConversationMessages,
  listConversations,
  markAllConversationsRead,
  sendMessage,
  startArtisanConversation,
} from "../controllers/conversation.controller.js";

const router = Router();

router.get("/", auth, listConversations);
router.patch("/read-all", auth, markAllConversationsRead);
router.post("/artisan/:artisanId", auth, startArtisanConversation);
router.get("/:id/messages", auth, getConversationMessages);
router.post("/:id/messages", auth, sendMessage);

export default router;
