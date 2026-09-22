const SafePlaceReport = require("../../models/SafePlaceReport");
const SafePlacePost = require("../../models/SafePlacePost");
const SafePlaceComment = require("../../models/SafePlaceComment");
const SafePlaceContentRevision = require("../../models/SafePlaceContentRevision");
const SafePlaceModerationLog = require("../../models/SafePlaceModerationLog");
const User = require("../../models/User");
const {
  createNotification,
  createManagementNotification,
} = require("../notification.service");
const suspension = require("./suspension.service");
const { safePlaceError } = require("../../utils/safePlace.utils");
function priority(reason) {
  return reason === "DANGER"
    ? "CRITICAL"
    : reason === "MEDICAL_MISINFORMATION"
      ? "HIGH"
      : "NORMAL";
}
async function resolveTarget(type, id) {
  const document =
    type === "POST"
      ? await SafePlacePost.findOne({ _id: id, status: "VISIBLE" })
      : await SafePlaceComment.findOne({ _id: id, status: "VISIBLE" });
  if (!document)
    throw safePlaceError(
      "Ce contenu ne peut pas être signalé.",
      "SAFE_PLACE_CONTENT_NOT_AVAILABLE",
      404,
    );
  const post =
    type === "POST" ? document : await SafePlacePost.findById(document.post);
  if (!post)
    throw safePlaceError(
      "Discussion introuvable.",
      "SAFE_PLACE_POST_NOT_FOUND",
      404,
    );
  return { document, post };
}
async function create(user, data) {
  const { post } = await resolveTarget(data.targetType, data.targetId);
  const key = `${user._id}:${data.targetType}:${data.targetId}`;
  if (await SafePlaceReport.exists({ openDedupeKey: key }))
    throw safePlaceError(
      "Tu as déjà un signalement ouvert pour ce contenu.",
      "SAFE_PLACE_REPORT_ALREADY_OPEN",
      409,
    );
  const report = await SafePlaceReport.create({
    reporter: user._id,
    targetType: data.targetType,
    targetId: data.targetId,
    post: post._id,
    reason: data.reason,
    details: data.details,
    priority: priority(data.reason),
    openDedupeKey: key,
  });
  await createManagementNotification({
    scope: "SAFE_PLACE",
    type: "ADMIN_SAFE_PLACE_REPORT",
    title: "Nouveau signalement Safe Place",
    message: "Un nouveau signalement nécessite une vérification.",
    targetType: "REPORT",
    targetId: report._id,
    actionPath: `/admin/safe-place/reports/${report._id}`,
    deduplicationKey: `admin-safe-place-report:${report._id}`,
  });
  return report;
}
async function mine(userId, query) {
  const page = query.page;
  const limit = query.limit;
  const [reports, total] = await Promise.all([
    SafePlaceReport.find({ reporter: userId })
      .select(
        "targetType targetId post reason priority status resolution adminComment createdAt resolvedAt",
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    SafePlaceReport.countDocuments({ reporter: userId }),
  ]);
  return {
    reports,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}
async function queue(query) {
  const page = query.page;
  const limit = query.limit;
  const filter = {};
  if (query.reason) filter.reason = query.reason;
  if (query.priority) filter.priority = query.priority;
  if (
    query.status &&
    [
      "OPEN",
      "IN_REVIEW",
      "WAITING_CORRECTION",
      "RESOLVED",
      "REJECTED",
    ].includes(query.status)
  )
    filter.status = query.status;
  else if (!query.status)
    filter.status = { $in: ["OPEN", "IN_REVIEW", "WAITING_CORRECTION"] };
  if (query.targetType) filter.targetType = query.targetType;
  if (query.dateFrom || query.dateTo)
    filter.createdAt = {
      ...(query.dateFrom && { $gte: query.dateFrom }),
      ...(query.dateTo && { $lte: query.dateTo }),
    };
  if (query.category) {
    const posts = await SafePlacePost.find({
      category: query.category,
    }).distinct("_id");
    filter.post = { $in: posts };
  }
  if (query.pseudonym) {
    const users = await User.find({
      pseudonym: new RegExp(
        query.pseudonym.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      ),
    }).distinct("_id");
    const targets = await Promise.all([
      SafePlacePost.find({ author: { $in: users } }).distinct("_id"),
      SafePlaceComment.find({ author: { $in: users } }).distinct("_id"),
    ]);
    filter.$or = [
      { targetType: "POST", targetId: { $in: targets[0] } },
      { targetType: "COMMENT", targetId: { $in: targets[1] } },
    ];
  }
  const sort =
    query.sort === "newest"
      ? { createdAt: -1 }
      : query.sort === "oldest"
        ? { createdAt: 1 }
        : { priority: 1, createdAt: 1 };
  const [reports, total] = await Promise.all([
    SafePlaceReport.find(filter)
      .populate("reporter", "pseudonym")
      .populate("post", "title category status")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    SafePlaceReport.countDocuments(filter),
  ]);
  const corrections = await Promise.all([
    SafePlacePost.find({
      status: { $in: ["PENDING_CORRECTION", "PENDING_REVIEW"] },
    })
      .populate("author", "pseudonym")
      .select("title status correctionRequest updatedAt")
      .lean(),
    SafePlaceComment.find({
      status: { $in: ["PENDING_CORRECTION", "PENDING_REVIEW"] },
    })
      .populate("author", "pseudonym")
      .select("post content status correctionRequest updatedAt")
      .lean(),
  ]);
  return {
    reports,
    corrections: { posts: corrections[0], comments: corrections[1] },
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}
async function detail(id) {
  const report = await SafePlaceReport.findById(id)
    .populate("reporter", "pseudonym email firstName lastName")
    .lean();
  if (!report)
    throw safePlaceError(
      "Signalement introuvable.",
      "SAFE_PLACE_REPORT_NOT_FOUND",
      404,
    );
  const Model = report.targetType === "POST" ? SafePlacePost : SafePlaceComment;
  const [content, revisions] = await Promise.all([
    Model.findById(report.targetId)
      .populate("author", "pseudonym email firstName lastName role")
      .lean(),
    SafePlaceContentRevision.find({
      targetType: report.targetType,
      targetId: report.targetId,
    })
      .sort({ createdAt: -1 })
      .lean(),
  ]);
  return { report, content, revisions };
}
async function takeReview(id, admin) {
  const report = await SafePlaceReport.findOne({ _id: id, status: "OPEN" });
  if (!report)
    throw safePlaceError(
      "Ce signalement n’est plus ouvert.",
      "SAFE_PLACE_REPORT_NOT_OPEN",
      409,
    );
  report.status = "IN_REVIEW";
  report.assignedTo = admin._id;
  report.reviewedAt = new Date();
  await report.save();
  await log(admin, report, "REPORT_REVIEW_STARTED");
  return report;
}
async function log(admin, report, action, reason = null, metadata = null) {
  return SafePlaceModerationLog.create({
    admin: admin._id,
    targetType: "REPORT",
    targetId: report._id,
    action,
    reason,
    metadata,
  });
}
async function closeReport(report, admin, status, resolution, comment) {
  report.status = status;
  report.resolution = resolution;
  report.adminComment = comment;
  report.resolvedBy = admin._id;
  report.resolvedAt = new Date();
  report.openDedupeKey = undefined;
  await report.save();
  await createNotification({
    recipient: report.reporter,
    actor: admin._id,
    type: "SAFE_PLACE_REPORT_RESOLVED",
    title: "Ton signalement a été traité",
    message: "Le détail de la décision est disponible dans la plateforme.",
    targetType: "REPORT",
    targetId: report._id,
    actionPath: "/safe-place/my-content/reports",
    mandatory: true,
    deduplicationKey: `safe-place-report-resolved:${report._id}`,
  });
  return report;
}
async function keep(id, admin, comment) {
  const report = await SafePlaceReport.findOne({
    _id: id,
    status: { $in: ["OPEN", "IN_REVIEW"] },
  });
  if (!report)
    throw safePlaceError(
      "Ce signalement est déjà traité.",
      "SAFE_PLACE_REPORT_CLOSED",
      409,
    );
  await closeReport(report, admin, "REJECTED", "CONTENT_KEPT", comment);
  await log(admin, report, "CONTENT_KEPT", comment);
  return report;
}
async function hide(id, admin, comment) {
  const report = await SafePlaceReport.findOne({
    _id: id,
    status: { $in: ["OPEN", "IN_REVIEW", "WAITING_CORRECTION"] },
  });
  if (!report)
    throw safePlaceError(
      "Ce signalement est déjà traité.",
      "SAFE_PLACE_REPORT_CLOSED",
      409,
    );
  const Model = report.targetType === "POST" ? SafePlacePost : SafePlaceComment;
  const content = await Model.findById(report.targetId);
  if (content) {
    const previous = {
      content: content.content,
      title: content.title,
      status: content.status,
    };
    content.status = "MODERATED";
    content.moderatedAt = new Date();
    await content.save();
    if (report.targetType === "COMMENT" && !content.parent)
      await SafePlaceComment.updateMany(
        { parent: content._id, status: "VISIBLE" },
        { $set: { status: "MODERATED", moderatedAt: new Date() } },
      );
    await SafePlaceContentRevision.create({
      targetType: report.targetType,
      targetId: content._id,
      actor: admin._id,
      actorRole: "ADMIN",
      pseudonymSnapshot: "Mélanie",
      action: "MODERATED",
      previousVersion: previous,
      newVersion: { status: "MODERATED" },
      reason: comment,
    });
    await createNotification({
      recipient: content.author,
      actor: admin._id,
      type: "SAFE_PLACE_MODERATION",
      title: "Contenu modéré",
      message: "Mélanie a masqué un de tes contenus dans le Safe Place.",
      targetType: report.targetType,
      targetId: content._id,
    });
  }
  await closeReport(report, admin, "RESOLVED", "CONTENT_HIDDEN", comment);
  await log(admin, report, "CONTENT_HIDDEN", comment);
  return report;
}
async function requestCorrection(id, admin, comment) {
  const report = await SafePlaceReport.findOne({
    _id: id,
    status: { $in: ["OPEN", "IN_REVIEW"] },
  });
  if (!report)
    throw safePlaceError(
      "Ce signalement est déjà traité.",
      "SAFE_PLACE_REPORT_CLOSED",
      409,
    );
  const Model = report.targetType === "POST" ? SafePlacePost : SafePlaceComment;
  const content = await Model.findById(report.targetId);
  if (!content)
    throw safePlaceError(
      "Contenu introuvable.",
      "SAFE_PLACE_CONTENT_NOT_AVAILABLE",
      404,
    );
  content.status = "PENDING_CORRECTION";
  content.correctionRequest = {
    message: comment,
    requestedAt: new Date(),
    requestedBy: admin._id,
  };
  await content.save();
  report.status = "WAITING_CORRECTION";
  report.assignedTo = admin._id;
  report.adminComment = comment;
  await report.save();
  await createNotification({
    recipient: content.author,
    actor: admin._id,
    type: "SAFE_PLACE_CORRECTION_REQUESTED",
    title: "Correction demandée",
    message: comment,
    targetType: report.targetType,
    targetId: content._id,
  });
  await log(admin, report, "CORRECTION_REQUESTED", comment);
  return report;
}
async function closeDiscussion(id, admin, comment) {
  const report = await SafePlaceReport.findOne({
    _id: id,
    status: { $in: ["OPEN", "IN_REVIEW", "WAITING_CORRECTION"] },
  });
  if (!report)
    throw safePlaceError(
      "Ce signalement est déjà traité.",
      "SAFE_PLACE_REPORT_CLOSED",
      409,
    );
  const post = await SafePlacePost.findById(report.post);
  if (post) {
    post.isClosed = true;
    post.closedAt = new Date();
    post.closedBy = admin._id;
    await post.save();
    await createNotification({
      recipient: post.author,
      actor: admin._id,
      type: "SAFE_PLACE_DISCUSSION_CLOSED",
      title: "Discussion fermée",
      message: "Mélanie a fermé ta discussion.",
      targetType: "POST",
      targetId: post._id,
    });
  }
  await closeReport(report, admin, "RESOLVED", "DISCUSSION_CLOSED", comment);
  await log(admin, report, "DISCUSSION_CLOSED", comment);
  return report;
}
async function suspendAuthor(id, admin, data) {
  const report = await SafePlaceReport.findOne({
    _id: id,
    status: { $in: ["OPEN", "IN_REVIEW", "WAITING_CORRECTION"] },
  });
  if (!report)
    throw safePlaceError(
      "Ce signalement est déjà traité.",
      "SAFE_PLACE_REPORT_CLOSED",
      409,
    );
  const Model = report.targetType === "POST" ? SafePlacePost : SafePlaceComment;
  const content = await Model.findById(report.targetId);
  if (!content?.author)
    throw safePlaceError(
      "L’autrice ne peut pas être suspendue.",
      "SAFE_PLACE_AUTHOR_NOT_FOUND",
      404,
    );
  const result = await suspension.suspend(admin, content.author, data);
  await closeReport(report, admin, "RESOLVED", "AUTHOR_SUSPENDED", data.reason);
  await log(admin, report, "AUTHOR_SUSPENDED", data.reason, {
    suspensionId: result._id,
  });
  return { report, suspension: result };
}
module.exports = {
  priority,
  create,
  mine,
  queue,
  detail,
  takeReview,
  keep,
  hide,
  requestCorrection,
  closeDiscussion,
  suspendAuthor,
  closeReport,
  log,
};
