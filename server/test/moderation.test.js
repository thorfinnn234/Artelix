import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import User from "../src/models/User.js";
import Artisan from "../src/models/artisan.js";
import ArtisanAppeal from "../src/models/artisanAppeal.js";
import Notification from "../src/models/notification.js";
import Report from "../src/models/report.js";
import { submitAppeal, listMyAppeals, resolveAppeal } from "../src/controllers/appeal.controller.js";
import { suspendArtisan, rejectArtisan } from "../src/controllers/artisan.controller.js";
import { createReport } from "../src/controllers/report.controller.js";

const ids = {
  artisanUser: "222222222222222222222222",
  admin: "333333333333333333333333",
  customer: "111111111111111111111111",
  listing: "444444444444444444444444",
};

// Chainable stand-in for a Mongoose query that resolves to a fixed value.
const query = (value) => {
  const q = { then: (ok, fail) => Promise.resolve(typeof value === "function" ? value() : value).then(ok, fail) };
  for (const name of ["select", "populate", "sort", "skip", "limit", "lean"]) q[name] = () => q;
  return q;
};

function response() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

function setup(t) {
  const listing = { _id: ids.listing, ownerId: ids.artisanUser, name: "Ade Plumbing", status: "suspended", moderationReason: "Customer complaints", save: async () => {} };
  const appeals = [];
  const notifications = [];
  const reports = [];
  t.mock.method(Notification, "create", async (data) => { notifications.push(data); return data; });
  t.mock.method(User, "find", () => query([{ _id: ids.admin }]));
  t.mock.method(Artisan, "findOne", () => query(listing));
  t.mock.method(Artisan, "findById", () => query(listing));
  t.mock.method(Artisan, "updateOne", async (filter, update) => {
    if (filter.status.$in.includes(listing.status)) Object.assign(listing, update.$set);
  });
  t.mock.method(ArtisanAppeal, "findOne", (filter) => query(appeals.find((a) => a.status === filter.status) || null));
  t.mock.method(ArtisanAppeal, "find", () => query(() => [...appeals].reverse()));
  t.mock.method(ArtisanAppeal, "exists", async () => appeals.length > 0);
  t.mock.method(ArtisanAppeal, "create", async (data) => {
    const appeal = { _id: new mongoose.Types.ObjectId().toString(), status: "pending", ...data };
    appeals.push(appeal);
    return appeal;
  });
  t.mock.method(ArtisanAppeal, "findOneAndUpdate", async (filter, update) => {
    const appeal = appeals.find((a) => a._id === filter._id && a.status === filter.status);
    return appeal ? Object.assign(appeal, update.$set) : null;
  });
  t.mock.method(ArtisanAppeal, "findById", (id) => query(appeals.find((a) => a._id === id)));
  t.mock.method(Report, "countDocuments", async () => 0);
  t.mock.method(Report, "findOne", async () => null);
  t.mock.method(Report, "create", async (data) => { const r = { _id: new mongoose.Types.ObjectId().toString(), ...data }; reports.push(r); return r; });
  t.mock.method(Report, "findById", (id) => query(reports.find((r) => r._id === id)));
  return { listing, appeals, notifications, reports };
}

const artisanReq = (body = {}) => ({ user: { _id: ids.artisanUser, role: "artisan", ArtisanId: ids.listing, fullName: "Ade" }, body, params: {}, query: {} });
const adminReq = (params, body) => ({ user: { _id: ids.admin, role: "admin" }, params, body, query: {} });

test("suspension and rejection require a reason and notify the artisan", async (t) => {
  const { notifications } = setup(t);
  let res = response();
  await suspendArtisan(adminReq({ id: ids.listing }, {}), res);
  assert.equal(res.statusCode, 400);
  assert.equal(notifications.length, 0);

  res = response();
  await suspendArtisan(adminReq({ id: ids.listing }, { reason: "Repeated no-shows on confirmed jobs." }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.Artisan.moderationReason, "Repeated no-shows on confirmed jobs.");
  assert.equal(notifications[0].userId, ids.artisanUser);
  assert.equal(notifications[0].type, "moderation");
  assert.match(notifications[0].message, /Repeated no-shows/);

  res = response();
  await rejectArtisan(adminReq({ id: ids.listing }, { reason: "  " }), res);
  assert.equal(res.statusCode, 400);
});

test("artisan appeals a suspension, sees its status, and is notified of the decision", async (t) => {
  const { listing, appeals, notifications } = setup(t);

  let res = response();
  await submitAppeal(artisanReq({ message: "too short" }), res);
  assert.equal(res.statusCode, 400);

  res = response();
  await submitAppeal(artisanReq({ message: "The complaints were from a single cancelled booking; see the booking log." }), res);
  assert.equal(res.statusCode, 201);
  assert.equal(appeals[0].appealedStatus, "suspended");
  assert.equal(appeals[0].appealedReason, "Customer complaints");
  assert.ok(notifications.some((n) => n.userId === ids.admin && n.type === "appeal"));

  res = response();
  await submitAppeal(artisanReq({ message: "A second appeal while the first one is still pending." }), res);
  assert.equal(res.statusCode, 409);

  res = response();
  await listMyAppeals(artisanReq(), res);
  assert.equal(res.body.canAppeal, false);
  assert.equal(res.body.listing.moderationReason, "Customer complaints");

  // Rejecting requires an explanation.
  res = response();
  await resolveAppeal(adminReq({ appealId: appeals[0]._id }, { decision: "reject" }), res);
  assert.equal(res.statusCode, 400);

  res = response();
  await resolveAppeal(adminReq({ appealId: appeals[0]._id }, { decision: "accept", adminNote: "Verified with booking history." }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(listing.status, "approved");
  assert.equal(listing.moderationReason, "");
  const decision = notifications.find((n) => n.userId === ids.artisanUser && n.type === "appeal");
  assert.equal(decision.title, "Your appeal was accepted");

  res = response();
  await resolveAppeal(adminReq({ appealId: appeals[0]._id }, { decision: "reject", adminNote: "Double resolution." }), res);
  assert.equal(res.statusCode, 409);
});

test("rejected appeals keep the listing suspended and explain why", async (t) => {
  const { listing, appeals, notifications } = setup(t);
  await submitAppeal(artisanReq({ message: "Please reconsider; I have resolved the complaints with customers." }), response());
  const res = response();
  await resolveAppeal(adminReq({ appealId: appeals[0]._id }, { decision: "reject", adminNote: "Complaints are still open." }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(listing.status, "suspended");
  const decision = notifications.find((n) => n.userId === ids.artisanUser && n.type === "appeal");
  assert.equal(decision.title, "Your appeal was not accepted");
  assert.match(decision.message, /remains suspended.*Complaints are still open/);
});

test("suspended artisans can contact support but cannot file misconduct reports", async (t) => {
  const { reports, notifications } = setup(t);
  const req = { user: { _id: ids.artisanUser, role: "artisan", isSuspended: true, fullName: "Ade" }, body: { kind: "support", category: "account", subject: "Suspension question", details: "I would like to understand my suspension." } };
  const res = response();
  await createReport(req, res);
  assert.equal(res.statusCode, 201);
  assert.equal(reports[0].kind, "support");
  assert.equal(reports[0].reporterRole, "artisan");
  assert.ok(notifications.some((n) => n.userId === ids.admin && n.title === "New support request"));

  await assert.rejects(
    createReport({ ...req, body: { kind: "misconduct", artisanId: ids.listing, category: "fraud", details: "Trying to report as an artisan." } }, response()),
    (error) => error.statusCode === 403,
  );
  await assert.rejects(
    createReport({ ...req, body: { ...req.body, subject: "" } }, response()),
    (error) => error.statusCode === 400,
  );
});
