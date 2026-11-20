import mongoose from "mongoose";
import Artisan from "../models/artisan.js";
import Report from "../models/report.js";
import Notification from "../models/notification.js";

const REPORT_CATEGORIES = ["safety", "fraud", "harassment", "poor_service", "other"];
const REPORT_STATUSES = ["open", "reviewing", "resolved", "dismissed"];

function invalid(message, statusCode = 400) {
  return Object.assign(new Error(message), { statusCode });
}

export async function createReport(req, res) {
  if (String(req.user.role).toLowerCase() !== "user" || req.user.isSuspended) {
    throw invalid("Only active customer accounts can submit reports.", 403);
  }
  const { artisanId, category, details } = req.body;
  if (!mongoose.isValidObjectId(artisanId)) throw invalid("Choose a valid artisan.");
  if (!REPORT_CATEGORIES.includes(category)) throw invalid("Choose a report category.");
  const message = String(details || "").trim();
  if (message.length < 15 || message.length > 4000) {
    throw invalid("Please provide between 15 and 4,000 characters so the team can review your report.");
  }
  const artisan = await Artisan.findById(artisanId).select("name ownerId");
  if (!artisan) throw invalid("Artisan not found.", 404);
  const duplicate = await Report.findOne({ reporterId: req.user._id, artisanId, status: { $in: ["open", "reviewing"] } });
  if (duplicate) throw invalid("You already have an open report for this artisan. We will update you when it is reviewed.", 409);

  const report = await Report.create({ reporterId: req.user._id, artisanId, category, details: message });
  res.status(201).json({ report });
}

export async function listMyReports(req, res) {
  const reports = await Report.find({ reporterId: req.user._id })
    .populate("artisanId", "name category")
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ reports });
}

export async function listReports(req, res) {
  const { status = "", page = "1", limit = "20" } = req.query;
  if (status && !REPORT_STATUSES.includes(status)) throw invalid("Invalid report status.");
  const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 20));
  const filter = status ? { status } : {};
  const [reports, total] = await Promise.all([
    Report.find(filter).populate("reporterId", "fullName email").populate("artisanId", "name category ownerId")
      .populate("resolvedBy", "fullName").sort({ createdAt: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize),
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
  await Notification.create({
    userId: report.reporterId,
    type: "system",
    title: "Report update",
    message: `Your report is now ${status.replace("_", " ")}.${note ? ` ${note.slice(0, 180)}` : ""}`,
    link: "/user/reports",
  });
  const updated = await Report.findById(id).populate("reporterId", "fullName email").populate("artisanId", "name category ownerId").populate("resolvedBy", "fullName");
  res.json({ report: updated });
}
