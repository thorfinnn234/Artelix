import mongoose from "mongoose";
import { z } from "zod";
import Booking from "../models/booking.js";
import Artisan from "../models/artisan.js";
import User from "../models/User.js";
import { notifyUser, notifyAdmins } from "../services/notify.js";
import { verifiedRating } from "../services/reviews.js";
import { bookingError, bookingTransition, parseBooking, participantRole, requestSchema } from "../services/bookingPolicy.js";
import { bookingPhotoRoot, saveBookingPhotos, removeBookingPhotos } from "../services/bookingPhotos.js";

const populate = query => query.populate("customerId", "fullName avatar").populate("artisanId", "name category status").populate("artisanOwnerId", "fullName avatar");
const id = value => { if (!mongoose.isValidObjectId(value)) throw bookingError("Invalid booking id."); return value; };
async function currentUser(req) {
  const user = await User.findById(req.user._id);
  if (!user) throw bookingError("Account not found.", 401);
  return user;
}
async function notify(booking, actor, title, message, type = "booking") {
  const recipients = actor.role === "admin" ? [booking.customerId, booking.artisanOwnerId] : [String(actor._id) === String(booking.customerId) ? booking.artisanOwnerId : booking.customerId];
  // notifyUser swallows failures so an already saved booking never becomes a failed request.
  await Promise.all(recipients.map(userId => notifyUser({
    userId, type, title, message,
    link: `/${String(userId) === String(booking.customerId) ? "user/bookings" : "artisan/jobs"}?booking=${booking._id}`,
  })));
}
const reason = note => note ? ` Reason: ${note.slice(0, 200)}` : "";
// Each booking action produces a notification that says what actually happened.
function bookingEvent(action, booking, actor, body) {
  const t = `"${booking.title}"`, who = actor.fullName || "The other party", note = typeof body.note === "string" ? body.note.trim() : "";
  switch (action) {
    case "quote": return ["Quote received", `${who} sent a quote for ${t}. Review and accept it to confirm the job.`];
    case "confirm": return ["Booking approved", `${who} accepted your quote for ${t}. The job is confirmed.`];
    case "decline": return ["Booking declined", `${t} was declined.${reason(note)}`];
    case "cancel": return ["Booking cancelled", `${who} cancelled ${t}.${reason(note)}`];
    case "start": return ["Work started", `${who} has started work on ${t}.`];
    case "finish": return ["Work marked finished", `${who} marked ${t} as finished. Please confirm completion.`];
    case "complete": return ["Job completed", `${who} confirmed ${t} is complete.`];
    case "dispute": return ["Issue reported on booking", `${who} reported a problem with ${t}. Artelix support will review it.${reason(note)}`];
    case "resolve": return ["Dispute resolved", `Artelix resolved the dispute on ${t} as ${body.outcome}.${reason(note)}`];
    case "propose_change": return ["Change proposed", `${who} proposed new terms for ${t}.`];
    case "accept_change": return ["Change accepted", `${who} accepted the proposed change to ${t}.`];
    case "reject_change": return ["Change rejected", `${who} rejected the proposed change to ${t}.`];
    default: return ["Booking updated", `${t}: ${action.replaceAll("_", " ")}.`];
  }
}
async function expire(filter = {}) {
  await Booking.updateMany({ ...filter, status: { $in: ["requested", "quoted"] }, expiresAt: { $lte: new Date() } }, {
    $set: { status: "expired" }, $inc: { __v: 1 },
    $push: { history: { action: "expire", status: "expired", actorId: null, note: "Request or quote expired after seven days without acceptance.", at: new Date() } },
  });
}
async function load(req, user) {
  const bookingId = id(req.params.id);
  // Check ownership before performing any expiry mutation.
  let booking = await Booking.findById(bookingId);
  if (!booking) throw bookingError("Booking not found.", 404);
  participantRole(booking, user);
  await expire({ _id: bookingId });
  booking = await Booking.findById(bookingId);
  return booking;
}
async function available(booking) {
  const [artisan, owner] = await Promise.all([Artisan.findById(booking.artisanId), User.findById(booking.artisanOwnerId)]);
  return artisan?.status === "approved" && artisan?.isAvailable !== false && !owner?.isSuspended && Boolean(owner) && String(artisan.ownerId) === String(booking.artisanOwnerId);
}
function expectedVersion(body) {
  const version = Number(body.version);
  if (body.version == null || body.version === "" || !Number.isSafeInteger(version) || version < 0) throw bookingError("Booking version is required. Refresh and try again.");
  return version;
}
async function mutate(booking, body, update, history) {
  const result = await Booking.findOneAndUpdate({ _id: booking._id, __v: expectedVersion(body) }, {
    $set: update, $inc: { __v: 1 }, $push: { history },
  }, { new: true, runValidators: true });
  if (!result) throw bookingError("This booking has changed. Refresh it before continuing.", 409);
  return result;
}
export async function createBooking(req, res) {
  const user = await currentUser(req);
  if (user.role !== "user" || user.isSuspended) throw bookingError("Only active customer accounts can request a booking.", 403);
  const data = parseBooking(requestSchema, req.body);
  const artisan = await Artisan.findById(data.artisanId);
  if (!artisan) throw bookingError("Artisan not found.", 404);
  const owner = await User.findById(artisan.ownerId);
  if (artisan.status !== "approved" || artisan.isAvailable === false || !owner || owner.isSuspended) throw bookingError("This artisan is not available for bookings.", 403);
  if (String(owner._id) === String(user._id)) throw bookingError("You cannot book your own listing.");
  const photos = await saveBookingPhotos(req.files);
  let booking;
  try {
    booking = await Booking.create({ ...data, customerId: user._id, artisanOwnerId: artisan.ownerId, photos,
      history: [{ action: "request", status: "requested", actorId: user._id, note: "Service requested.", at: new Date() }] });
  } catch (error) { await removeBookingPhotos(photos); throw error; }
  await notify(booking, user, "New job request", `${user.fullName} requested: ${booking.title}`);
  res.status(201).json({ booking: await populate(Booking.findById(booking._id)) });
}
export async function listBookings(req, res) {
  const user = await currentUser(req);
  const filter = user.role === "admin" ? {} : user.role === "user" ? { customerId: user._id } : user.role === "artisan" ? { artisanOwnerId: user._id } : null;
  if (!filter) throw bookingError("Bookings are unavailable for this account.", 403);
  await expire(filter);
  if (req.query.status) {
    const statuses = Booking.schema.path("status").enumValues;
    if (!statuses.includes(req.query.status)) throw bookingError("Invalid booking status.");
    filter.status = req.query.status;
  }
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = 20;
  const [bookings, total] = await Promise.all([
    populate(Booking.find(filter).select("-messages -history").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)), Booking.countDocuments(filter),
  ]);
  res.json({ bookings, total, page, pages: Math.ceil(total / limit) });
}
export async function getBooking(req, res) {
  const user = await currentUser(req);
  const booking = await load(req, user);
  res.json({ booking: await populate(Booking.findById(booking._id)) });
}
export async function actOnBooking(req, res) {
  const user = await currentUser(req);
  const booking = await load(req, user);
  const action = req.params.action;
  // Suspended participants may still cancel or raise/resolve issues with existing jobs.
  if (user.isSuspended && !["cancel", "decline", "dispute", "complete", "reject_change"].includes(action)) throw bookingError("Your account is suspended.", 403);
  const { update, history } = bookingTransition(booking, user, action, req.body, await available(booking));
  if (req.files?.length && action !== "finish") throw bookingError("Completion photos can only be added when finishing work.");
  const photos = action === "finish" ? await saveBookingPhotos(req.files) : [];
  if (action === "finish") update.completionPhotos = photos;
  let updated;
  try { updated = await mutate(booking, req.body, update, history); }
  catch (error) { await removeBookingPhotos(photos); throw error; }
  const [title, message] = bookingEvent(action, updated, user, req.body);
  await notify(updated, user, title, message);
  if (action === "dispute") await notifyAdmins({ type: "support", title: "New booking dispute", message: `${user.fullName} disputed "${updated.title}".`, link: `/admin/bookings?booking=${updated._id}` });
  res.json({ booking: await populate(Booking.findById(updated._id)) });
}
export async function addBookingMessage(req, res) {
  const user = await currentUser(req);
  const booking = await load(req, user);
  if (user.role === "admin") throw bookingError("Administrators should use dispute resolution notes.", 403);
  const { body } = parseBooking(z.object({ body: z.string().trim().min(1).max(2000) }), req.body);
  if (booking.messages.length >= 500) throw bookingError("This booking has reached its message limit.");
  const updated = await Booking.findOneAndUpdate({ _id: booking._id, "messages.499": { $exists: false } }, {
    $push: { messages: { senderId: user._id, senderName: user.fullName, body, at: new Date() } },
  }, { new: true, runValidators: true });
  if (!updated) throw bookingError("This booking has reached its message limit.", 409);
  await notify(updated, user, "New booking message", `${user.fullName}: ${body.slice(0, 100)}`, "message");
  res.json({ booking: await populate(Booking.findById(updated._id)) });
}
export async function reviewBooking(req, res) {
  const user = await currentUser(req);
  const booking = await load(req, user);
  if (participantRole(booking, user) !== "customer" || booking.status !== "completed") throw bookingError("Only customers can review their completed bookings.", 403);
  if (booking.review) throw bookingError("This booking already has a review.", 409);
  const review = parseBooking(z.object({ rating: z.coerce.number().int().min(1).max(5), comment: z.string().trim().max(2000).default("") }), req.body);
  let updated;
  const session = await mongoose.startSession();
  try { await session.withTransaction(async () => {
  updated = await Booking.findOneAndUpdate({ _id: booking._id, status: "completed", review: null }, {
    $set: { review: { ...review, createdAt: new Date() } }, $inc: { __v: 1 },
    $push: { history: { action: "review", status: "completed", actorId: user._id, note: `Verified review: ${review.rating}/5.`, at: new Date() } },
  }, { new: true, runValidators: true, session });
  if (!updated) throw bookingError("This booking already has a review.", 409);
  // The public rating is computed only from reviews attached to completed bookings,
  // so every star counted comes from a customer who actually received the service.
  await Artisan.findByIdAndUpdate(booking.artisanId, { rating: await verifiedRating(booking.artisanId, session) }, { session });
  }); } finally { await session.endSession(); }
  await notify(updated, user, "New verified review", `${user.fullName} rated "${updated.title}" ${review.rating}/5.`, "review");
  res.json({ booking: await populate(Booking.findById(updated._id)) });
}
export async function getBookingPhoto(req, res) {
  const user = await currentUser(req);
  const booking = await load(req, user);
  const name = req.params.name;
  if (!booking.photos.includes(name) && !booking.completionPhotos.includes(name)) throw bookingError("Photo not found.", 404);
  if (!/^[a-f\d-]+\.(png|jpg|webp)$/.test(name)) throw bookingError("Invalid photo.");
  res.set("Cache-Control", "private, no-store");
  res.sendFile(name, { root: bookingPhotoRoot });
}
