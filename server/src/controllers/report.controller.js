import mongoose from "mongoose";
import Artisan from "../models/artisan.js";
import Booking from "../models/booking.js";
import Report, { MISCONDUCT_CATEGORIES, SUPPORT_CATEGORIES } from "../models/report.js";
import { notifyAdmins, notifyUser } from "../services/notify.js";

const REPORT_STATUSES = ["open", "reviewing", "resolved", "dismissed"];
const REPORT_KINDS = ["misconduct", "support"];

function invalid(message, statusCode = 400) {
  return Object.assign(new Error(message), { statusCode });
}

const populateReport = (query) => query
  .populate("reporterId", "fullName email role")
  .populate("artisanId", "name category ownerId")
  .populate("bookingId", "title status")
  .populate("resolvedBy", "fullName");

// Optional booking reference: the reporter must be a participant in it.
async function linkedBooking(bookingId, user) {
  if (!bookingId) return null;
  if (!mongoose.isValidObjectId(bookingId)) throw invalid("Choose a valid booking.");
  const booking = await Booking.findById(bookingId).select("customerId artisanOwnerId artisanId title");
  const isParticipant = booking && [booking.customerId, booking.artisanOwnerId].some((id) => String(id) === String(user._id));
  if (!isParticipant) throw invalid("You can only reference your own bookings.", 403);
  return booking;
}

export async function createReport(req, res) {
  const role = String(req.user.role).toLowerCase();
  if (!["user", "artisan"].includes(role)) throw invalid("Only customer and artisan accounts can contact support.", 403);

  const kind = req.body.kind === "support" ? "support" : "misconduct";
  const { category } = req.body;
  const message = String(req.body.details || "").trim();
  if (message.length < 15 || message.length > 4000) {
    throw invalid("Please provide between 15 and 4,000 characters so the team can review your request.");
  }
  const booking = await linkedBooking(req.body.bookingId, req.user);

  let report;
  if (kind === "misconduct") {
    if (role !== "user" || req.user.isSuspended) {
      throw invalid("Only active customer accounts can report a listing. Use Contact support for other concerns.", 403);
    }
    const { artisanId } = req.body;
    if (!mongoose.isValidObjectId(artisanId)) throw invalid("Choose a valid artisan.");
    if (!MISCONDUCT_CATEGORIES.includes(category)) throw invalid("Choose a report category.");
    const artisan = await Artisan.findById(artisanId).select("name ownerId");
    if (!artisan) throw invalid("Artisan not found.", 404);
    if (booking && String(booking.artisanId) !== String(artisanId)) throw invalid("That booking is not with this artisan.");
    const duplicate = await Report.findOne({ kind: "misconduct", reporterId: req.user._id, artisanId, status: { $in: ["open", "reviewing"] } });
    if (duplicate) throw invalid("You already have an open report for this artisan. We will update you when it is reviewed.", 409);
    report = await Report.create({ kind, reporterId: req.user._id, reporterRole: role, artisanId, bookingId: booking?._id || null, category, details: message });
    await notifyAdmins({ type: "support", title: "New misconduct report", message: `${req.user.fullName} reported ${artisan.name}.`, link: "/admin/reported" });
  } else {
    // Suspended accounts may still contact support; that is often why they need it.
    if (!SUPPORT_CATEGORIES.includes(category)) throw invalid("Choose what you need help with.");
    const subject = String(req.body.subject || "").trim();
    if (subject.length < 3 || subject.length > 120) throw invalid("Add a short subject (3 to 120 characters).");
    const openCount = await Report.countDocuments({ kind: "support", reporterId: req.user._id, status: { $in: ["open", "reviewing"] } });
    if (openCount >= 5) throw invalid("You have 5 open support requests. Please wait for a response before opening more.", 429);
    report = await Report.create({ kind, reporterId: req.user._id, reporterRole: role, bookingId: booking?._id || null, category, subject, details: message });
    await notifyAdmins({ type: "support", title: "New support request", message: `${req.user.fullName}: ${subject}`, link: "/admin/reported" });
  }

  res.status(201).json({ report: await populateReport(Report.findById(report._id)) });
}

export async function listMyReports(req, res) {
  const reports = await Report.find({ reporterId: req.user._id })
    .populate("artisanId", "name category")
    .populate("bookingId", "title status")
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ reports });
}

export async function listReports(req, res) {
  const { status = "", kind = "", page = "1", limit = "20" } = req.query;
  if (status && !REPORT_STATUSES.includes(status)) throw invalid("Invalid report status.");
  if (kind && !REPORT_KINDS.includes(kind)) throw invalid("Invalid report type.");
  const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 20));
  const filter = {};
  if (status) filter.status = status;
  // Reports created before support requests existed have no kind and are misconduct reports.
  if (kind === "support") filter.kind = "support";
  if (kind === "misconduct") filter.kind = { $ne: "support" };
  const [reports, total] = await Promise.all([
    populateReport(Report.find(filter)).sort({ createdAt: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize),
    Report.countDocuments(filter),
  ]);
  res.json({ reports, total, page: pageNumber, pages: Math.ceil(total / pageSize) || 1 });
}

export async function updateReport(req, res) {
  const { id } = req.params;
  const { status, resolutionNote = "" } = req.body;
  if (!mongoose.isValidObjectId(id)) throw invalid("Invalid report id.");
  if (!REPORT_STATUSES.includes(status)) throw invalid("Choose a valid report status.");
  const note = String(resolutionNote).trim();
  if (["resolved", "dismissed"].includes(status) && note.length < 5) {
    throw invalid("Add a clear resolution note before closing a report.");
  }
  if (note.length > 4000) throw invalid("Resolution notes cannot exceed 4,000 characters.");
  const report = await Report.findById(id);
  if (!report) throw invalid("Report not found.", 404);
  report.status = status;
  report.resolutionNote = note;
  if (["resolved", "dismissed"].includes(status)) {
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
  } else {
    report.resolvedBy = null;
    report.resolvedAt = null;
  }
  await report.save();
  const isSupport = report.kind === "support";
  await notifyUser({
    userId: report.reporterId,
    type: "support",
    title: isSupport ? "Support request update" : "Report update",
    message: `Your ${isSupport ? "support request" : "report"} is now ${status}.${note ? ` ${note.slice(0, 180)}` : ""}`,
    link: report.reporterRole === "artisan" ? "/artisan/support" : "/user/reports",
  });
  res.json({ report: await populateReport(Report.findById(id)) });
}
