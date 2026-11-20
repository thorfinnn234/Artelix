import test from "node:test";
import assert from "node:assert/strict";
import { bookingTransition, participantRole, parseBooking, requestSchema } from "../src/services/bookingPolicy.js";
import Booking from "../src/models/booking.js";
import { saveBookingPhotos } from "../src/services/bookingPhotos.js";

const customer = { _id: "111111111111111111111111", role: "user" };
const artisan = { _id: "222222222222222222222222", role: "artisan" };
const admin = { _id: "333333333333333333333333", role: "admin" };
const base = () => ({ customerId: customer._id, artisanOwnerId: artisan._id, status: "requested", quote: null, pendingChange: null });
const terms = () => ({ price: "25000.50", scope: "Repair kitchen pipe and test for leaks.", scheduledAt: new Date(Date.now() + 86400000).toISOString() });
function act(booking, user, action, body = {}, available = true) {
  const result = bookingTransition(booking, user, action, body, available);
  Object.assign(booking, result.update);
  return result;
}
test("complete request → quote → confirmation → work → customer completion workflow", () => {
  const b = base();
  const quote = act(b, artisan, "quote", terms());
  assert.equal(b.status, "quoted"); assert.equal(b.quote.price, 25000.5);
  assert.equal(quote.history.actorId, artisan._id); assert.equal(quote.history.terms.scope, terms().scope);
  act(b, customer, "confirm"); assert.equal(b.status, "confirmed"); assert.equal(b.expiresAt, null);
  act(b, artisan, "start"); assert.equal(b.status, "in_progress");
  act(b, artisan, "finish", { note: "Pipe repaired and tested." }); assert.equal(b.status, "awaiting_confirmation");
  act(b, customer, "complete"); assert.equal(b.status, "completed");
  assert.throws(() => act(b, artisan, "start"), /no longer available/);
});
test("only the correct party can perform each milestone", () => {
  const b = base();
  assert.throws(() => act(b, customer, "quote", terms()), /cannot perform/);
  act(b, artisan, "quote", terms());
  assert.throws(() => act(b, artisan, "confirm"), /cannot perform/);
  act(b, customer, "confirm");
  assert.throws(() => act(b, customer, "start"), /cannot perform/);
  act(b, artisan, "start"); act(b, artisan, "finish", { note: "Everything is finished." });
  assert.throws(() => act(b, artisan, "complete"), /cannot perform/);
});
test("unrelated customers and artisans cannot access another booking", () => {
  for (const role of ["user", "artisan"]) assert.throws(() => participantRole(base(), { _id: "other", role }), /cannot access/);
  assert.equal(participantRole(base(), admin), "admin");
});
test("suspended or unavailable artisans cannot quote, confirm, start or finish new work", () => {
  for (const [status, action, user, body] of [["requested", "quote", artisan, terms()], ["quoted", "confirm", customer, {}], ["confirmed", "start", artisan, {}], ["in_progress", "finish", artisan, { note: "Work finished." }]]) {
    assert.throws(() => act({ ...base(), status, quote: terms() }, user, action, body, false), /suspended or unavailable/);
  }
  const b = { ...base(), status: "confirmed" };
  act(b, artisan, "cancel", { note: "Cannot attend this appointment." }, false); assert.equal(b.status, "cancelled");
});
test("a price or schedule change requires the other participant's agreement", () => {
  const b = base(); act(b, artisan, "quote", terms()); act(b, customer, "confirm");
  const originalPrice = b.quote.price;
  act(b, customer, "propose_change", { ...terms(), price: 30000 });
  assert.equal(b.quote.price, originalPrice);
  assert.throws(() => act(b, customer, "accept_change"), /other party/);
  assert.throws(() => act(b, artisan, "start"), /Resolve the proposed change/);
  assert.throws(() => act(b, artisan, "propose_change", terms()), /already awaiting/);
  act(b, artisan, "accept_change"); assert.equal(b.quote.price, 30000); assert.equal(b.pendingChange, null);
  act(b, artisan, "propose_change", { ...terms(), price: 45000 }); act(b, customer, "reject_change");
  assert.equal(b.quote.price, 30000); assert.equal(b.pendingChange, null);
});
test("cancellations and declines require reasons and obey the workflow", () => {
  assert.throws(() => act(base(), customer, "cancel"), /provide a reason/);
  assert.throws(() => act(base(), customer, "decline", { note: "No longer needed." }), /no longer available/);
  const b = base(); act(b, artisan, "decline", { note: "Outside my service area." }); assert.equal(b.status, "declined");
  assert.throws(() => act({ ...base(), status: "in_progress" }, customer, "cancel", { note: "Please cancel." }), /no longer available/);
});
test("disputes preserve a reason and only an admin can resolve them", () => {
  const b = { ...base(), status: "in_progress" };
  act(b, customer, "dispute", { note: "The work does not match our agreed scope." }); assert.equal(b.status, "disputed");
  assert.throws(() => act(b, artisan, "resolve", { note: "Resolved together.", outcome: "completed" }), /cannot perform/);
  assert.throws(() => act(b, admin, "resolve", { note: "Resolved together.", outcome: "approved" }), /Choose completed or cancelled/);
  const result = act(b, admin, "resolve", { note: "Both parties agreed the work is complete.", outcome: "completed" });
  assert.equal(b.status, "completed"); assert.equal(result.history.actorId, admin._id);
});
test("requests validate future dates, text lengths and numeric budgets", () => {
  const request = { artisanId: "444444444444444444444444", title: "Repair pipe", description: "Kitchen pipe is leaking.", location: "Yaba, Lagos", preferredAt: new Date(Date.now() + 86400000), budget: "" };
  assert.equal(parseBooking(requestSchema, request).budget, null);
  for (const bad of [{ preferredAt: "2020-01-01" }, { preferredAt: "bad date" }, { budget: "-1" }, { budget: "Infinity" }, { artisanId: "bad-id" }, { description: "tiny" }]) assert.throws(() => parseBooking(requestSchema, { ...request, ...bad }));
  for (const price of ["", "-5", "abc", "1.234", "Infinity"]) assert.throws(() => act(base(), artisan, "quote", { ...terms(), price }));
});
test("past quotes and proposed changes cannot be accepted", () => {
  assert.throws(() => act({ ...base(), status: "quoted", quote: { ...terms(), scheduledAt: "2020-01-01" } }, customer, "confirm"), /future appointment/);
  assert.throws(() => act({ ...base(), status: "confirmed", pendingChange: { ...terms(), proposedBy: artisan._id, scheduledAt: "2020-01-01" } }, customer, "accept_change"), /appointment has passed/);
});
test("model defaults preserve audit, photos, messages, version and expiry fields", () => {
  const b = new Booking({ customerId: customer._id, artisanOwnerId: artisan._id, artisanId: "444444444444444444444444", title: "Repair pipe", description: "Kitchen pipe is leaking.", location: "Yaba, Lagos", preferredAt: new Date() });
  assert.equal(b.validateSync(), undefined); assert.equal(b.status, "requested"); assert.equal(b.review, null);
  assert.deepEqual(b.photos.toObject(), []); assert.deepEqual(b.messages.toObject(), []); assert.ok(b.expiresAt > new Date());
});
test("executable and spoofed image attachments are rejected before disk writes", async () => {
  await assert.rejects(saveBookingPhotos([{ mimetype: "image/png", buffer: Buffer.from('<svg onload="alert(1)"></svg>') }]), /PNG, JPEG, or WebP/);
});
