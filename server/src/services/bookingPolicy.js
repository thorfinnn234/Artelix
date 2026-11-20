import { z } from "zod";

export function bookingError(message, statusCode = 400) {
  return Object.assign(new Error(message), { statusCode });
}
const text = (min, max) => z.string().trim().min(min).max(max);
const date = z.coerce.date().refine(value => value.getTime() > Date.now(), "Choose a future date and time.");
const amount = z.union([z.number(), z.string().trim().min(1)]).pipe(z.coerce.number().finite().min(0).max(100000000).refine(value => Math.abs(value * 100 - Math.round(value * 100)) < 0.00001, "Use no more than two decimal places."));
export const requestSchema = z.object({
  artisanId: text(24, 24).regex(/^[a-f\d]{24}$/i), title: text(3, 120), description: text(10, 4000),
  location: text(5, 500), preferredAt: date,
  budget: z.preprocess(v => v === "" || v == null ? null : v, amount.nullable()).optional(),
});
const termsSchema = z.object({ price: amount, scope: text(10, 4000), scheduledAt: date });
export function parseBooking(schema, body) {
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw bookingError(parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join(" "));
  return parsed.data;
}
export function participantRole(booking, user) {
  if (user.role === "admin") return "admin";
  if (user.role === "user" && String(booking.customerId) === String(user._id)) return "customer";
  if (user.role === "artisan" && String(booking.artisanOwnerId) === String(user._id)) return "artisan";
  throw bookingError("You cannot access this booking.", 403);
}
export function bookingTransition(booking, user, action, body = {}, available = true) {
  const role = participantRole(booking, user);
  const status = booking.status;
  const note = typeof body.note === "string" ? body.note.trim() : "";
  if (note.length > 4000) throw bookingError("Notes must be 4000 characters or fewer.");
  const requireState = (roles, statuses) => {
    if (!roles.includes(role)) throw bookingError("You cannot perform this action.", 403);
    if (!statuses.includes(status)) throw bookingError("This action is no longer available. Refresh the booking.", 409);
  };
  const requireNote = () => { if (note.length < 5) throw bookingError("Please provide a reason (at least 5 characters)."); };
  const requireAvailable = () => { if (!available || user.isSuspended) throw bookingError("This artisan is suspended or unavailable for booking work.", 403); };
  let update = {}, terms = null;
  switch (action) {
    case "quote":
      requireState(["artisan"], ["requested", "quoted"]); requireAvailable();
      terms = { ...parseBooking(termsSchema, body), proposedBy: user._id };
      update = { status: "quoted", quote: terms, expiresAt: new Date(Date.now() + 7 * 86400000) }; break;
    case "confirm":
      requireState(["customer"], ["quoted"]); requireAvailable();
      if (!booking.quote || new Date(booking.quote.scheduledAt) <= new Date()) throw bookingError("Ask the artisan for a quote with a future appointment.");
      update = { status: "confirmed", expiresAt: null }; break;
    case "decline":
      requireState(["artisan", "customer"], role === "artisan" ? ["requested", "quoted"] : ["quoted"]); requireNote();
      update = { status: "declined", expiresAt: null, pendingChange: null }; break;
    case "cancel":
      requireState(["artisan", "customer"], ["requested", "quoted", "confirmed"]); requireNote();
      update = { status: "cancelled", expiresAt: null, pendingChange: null }; break;
    case "start":
      requireState(["artisan"], ["confirmed"]); requireAvailable();
      if (booking.pendingChange) throw bookingError("Resolve the proposed change before starting work.", 409);
      update = { status: "in_progress" }; break;
    case "finish":
      requireState(["artisan"], ["in_progress"]); requireAvailable(); requireNote();
      if (booking.pendingChange) throw bookingError("Resolve the proposed change before finishing work.", 409);
      update = { status: "awaiting_confirmation", completionNotes: note }; break;
    case "complete":
      requireState(["customer"], ["awaiting_confirmation"]); update = { status: "completed" }; break;
    case "dispute":
      requireState(["customer", "artisan"], ["confirmed", "in_progress", "awaiting_confirmation"]); requireNote();
      update = { status: "disputed", pendingChange: null }; break;
    case "resolve":
      requireState(["admin"], ["disputed"]); requireNote();
      if (!["completed", "cancelled"].includes(body.outcome)) throw bookingError("Choose completed or cancelled.");
      update = { status: body.outcome }; break;
    case "propose_change":
      requireState(["customer", "artisan"], ["confirmed", "in_progress"]); requireAvailable();
      if (booking.pendingChange) throw bookingError("A proposed change is already awaiting a response.", 409);
      terms = { ...parseBooking(termsSchema, body), proposedBy: user._id };
      update = { pendingChange: terms }; break;
    case "accept_change": case "reject_change":
      requireState(["customer", "artisan"], ["confirmed", "in_progress"]);
      if (!booking.pendingChange || String(booking.pendingChange.proposedBy) === String(user._id)) throw bookingError("Only the other party can respond to a proposed change.", 409);
      if (action === "accept_change") {
        requireAvailable();
        if (new Date(booking.pendingChange.scheduledAt) <= new Date()) throw bookingError("The proposed appointment has passed. Reject this change and propose another.");
        terms = booking.pendingChange.toObject?.() || booking.pendingChange;
        update.quote = terms;
      }
      update.pendingChange = null; break;
    default: throw bookingError("Unknown booking action.");
  }
  return { update, history: { action, status: update.status || status, actorId: user._id, note, at: new Date(), terms } };
}
