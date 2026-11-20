import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { createBooking, listBookings, getBooking, actOnBooking, addBookingMessage, reviewBooking, getBookingPhoto } from "../controllers/booking.controller.js";
import { bookingUpload } from "../services/bookingPhotos.js";
const router = Router();
router.use(auth);
function photos(req, res, next) {
  bookingUpload(req, res, error => error ? res.status(400).json({ message: error.code === "LIMIT_FILE_SIZE" ? "Each photo must be 5 MB or smaller." : "Upload up to four photos, each 5 MB or smaller." }) : next());
}
router.get("/", listBookings);
router.post("/", photos, createBooking);
router.get("/:id", getBooking);
router.get("/:id/photos/:name", getBookingPhoto);
router.post("/:id/messages", addBookingMessage);
router.post("/:id/review", reviewBooking);
router.post("/:id/actions/:action", photos, actOnBooking);
export default router;
