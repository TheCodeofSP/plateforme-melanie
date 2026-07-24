const Resource = require("../../models/Resource");
const ResourceComment = require("../../models/ResourceComment");
const ResourceReport = require("../../models/ResourceReport");
const { createResourceError } = require("../../utils/resource.utils");
const { moderateCommentTree } = require("./resourceInteraction.service");
const { requestChanges } = require("./resourceReview.service");
const { log } = require("./resource.service");

async function createReport(user, data) {
  const { activePublicationFilter } = require("./resource.service");
  const resource = await Resource.findOne({ _id: data.resourceId, ...activePublicationFilter() });
  if (!resource) throw createResourceError("Cette ressource ne peut pas être signalée.", "RESOURCE_NOT_AVAILABLE", 404);
  let comment = null;
  if (data.targetType === "COMMENT") {
    comment = await ResourceComment.findOne({ _id: data.commentId, resource: resource._id, deletionState: "VISIBLE" });
    if (!comment) throw createResourceError("Ce commentaire n’est pas disponible.", "COMMENT_NOT_FOUND", 404);
  }
  const duplicate = await ResourceReport.exists({ reporter: user._id, targetType: data.targetType, resource: resource._id, comment: comment?._id || null, status: "OPEN" });
  if (duplicate) throw createResourceError("Tu as déjà un signalement ouvert pour ce contenu.", "REPORT_ALREADY_OPEN", 409);
  const openDedupeKey = `${user._id}:${data.targetType}:${comment?._id || resource._id}`;
  return ResourceReport.create({ reporter: user._id, targetType: data.targetType, resource: resource._id, comment: comment?._id || null, reason: data.reason, details: data.details, openDedupeKey });
}

async function listReports(query = {}) {
  const page = query.page || 1; const limit = query.limit || 20; const filter = {}; if (query.status) filter.status = query.status; if (query.targetType) filter.targetType = query.targetType; if (query.reason) filter.reason = query.reason;
  const [reports, total] = await Promise.all([ResourceReport.find(filter).populate("reporter", "pseudonym").populate("resource", "slug publishedVersion.title publicationStatus").populate("comment").sort({ createdAt: query.sort === "newest" ? -1 : 1 }).skip((page - 1) * limit).limit(limit).lean(), ResourceReport.countDocuments(filter)]);
  return { reports, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function resolveReport(reportId, admin, data) {
  const report = await ResourceReport.findOne({ _id: reportId, status: "OPEN" });
  if (!report) throw createResourceError("Ce signalement n’est plus ouvert.", "REPORT_NOT_OPEN", 404);
  if (data.resolution === "COMMENT_REMOVED") {
    if (!report.comment) throw createResourceError("Ce signalement ne concerne pas un commentaire.", "INVALID_RESOLUTION", 400);
    await moderateCommentTree(report.comment, admin);
  } else if (data.resolution === "CORRECTION_REQUESTED") {
    await requestChanges(report.resource, admin, data.comment || "Une correction est demandée à la suite d’un signalement.");
  } else if (["RESOURCE_UNPUBLISHED", "RESOURCE_ARCHIVED"].includes(data.resolution)) {
    const status = data.resolution === "RESOURCE_ARCHIVED" ? "ARCHIVED" : "UNPUBLISHED";
    const update = { publicationStatus: status, ...(status === "ARCHIVED" ? { archivedAt: new Date() } : { unpublishedAt: new Date() }) };
    await Resource.updateOne({ _id: report.resource }, update);
    await log(report.resource, admin, status, data.comment);
  }
  report.status = data.status; report.resolution = data.resolution; report.adminComment = data.comment; report.resolvedBy = admin._id; report.resolvedAt = new Date(); report.openDedupeKey = undefined;
  await report.save(); return report;
}

module.exports = { createReport, listReports, resolveReport };
