const SafePlacePost = require("../../models/SafePlacePost");
const SafePlaceComment = require("../../models/SafePlaceComment");
const SafePlaceCategory = require("../../models/SafePlaceCategory");
const SafePlaceContentRevision = require("../../models/SafePlaceContentRevision");
const SafePlaceModerationLog = require("../../models/SafePlaceModerationLog");
const SafePlaceReport = require("../../models/SafePlaceReport");
const MediaAsset = require("../../models/MediaAsset");
const { createNotification } = require("../notification.service");
const { safePlaceError } = require("../../utils/safePlace.utils");

async function modLog(admin, type, id, action, reason = null, metadata = null) {
  return SafePlaceModerationLog.create({
    admin: admin._id,
    targetType: type,
    targetId: id,
    action,
    reason,
    metadata,
  });
}

async function postAction(id, admin, action, reason) {
  const post = await SafePlacePost.findById(id);
  if (!post)
    throw safePlaceError(
      "Discussion introuvable.",
      "SAFE_PLACE_POST_NOT_FOUND",
      404,
    );
  if (action === "CLOSE")
    Object.assign(post, {
      isClosed: true,
      closedAt: new Date(),
      closedBy: admin._id,
    });
  if (action === "REOPEN")
    Object.assign(post, { isClosed: false, closedAt: null, closedBy: null });
  if (action === "PIN")
    Object.assign(post, {
      isPinned: true,
      pinnedAt: new Date(),
      pinnedBy: admin._id,
    });
  if (action === "UNPIN")
    Object.assign(post, { isPinned: false, pinnedAt: null, pinnedBy: null });
  await post.save();
  await modLog(admin, "POST", post._id, `POST_${action}`, reason);
  if (action === "CLOSE")
    await createNotification({
      recipient: post.author,
      actor: admin._id,
      type: "SAFE_PLACE_DISCUSSION_CLOSED",
      title: "Discussion fermée",
      message: "Mélanie a fermé ta discussion.",
      targetType: "POST",
      targetId: post._id,
    });
  return post;
}

async function move(id, admin, categoryId, reason) {
  const [post, category] = await Promise.all([
    SafePlacePost.findById(id),
    SafePlaceCategory.findOne({ _id: categoryId, status: "ACTIVE" }),
  ]);
  if (!post || !category)
    throw safePlaceError(
      "Discussion ou catégorie introuvable.",
      "SAFE_PLACE_MOVE_NOT_AVAILABLE",
      404,
    );
  const previous = post.category;
  post.category = category._id;
  await post.save();
  await Promise.all([
    SafePlaceCategory.updateOne(
      { _id: previous },
      { $inc: { "counters.posts": -1 } },
    ),
    SafePlaceCategory.updateOne(
      { _id: category._id },
      { $inc: { "counters.posts": 1 } },
    ),
  ]);
  await modLog(admin, "POST", post._id, "POST_MOVED", reason, {
    previousCategory: previous,
    category: category._id,
  });
  return post;
}

async function warning(id, admin, text) {
  const post = await SafePlacePost.findById(id);
  if (!post)
    throw safePlaceError(
      "Discussion introuvable.",
      "SAFE_PLACE_POST_NOT_FOUND",
      404,
    );
  post.adminWarning = { text, addedAt: new Date(), addedBy: admin._id };
  await post.save();
  await modLog(admin, "POST", id, "WARNING_SET", text);
  return post;
}
async function removeWarning(id, admin) {
  const post = await SafePlacePost.findById(id);
  if (!post)
    throw safePlaceError(
      "Discussion introuvable.",
      "SAFE_PLACE_POST_NOT_FOUND",
      404,
    );
  post.adminWarning = { text: null, addedAt: null, addedBy: null };
  await post.save();
  await modLog(admin, "POST", id, "WARNING_REMOVED");
  return post;
}

async function hideContent(type, id, admin, reason) {
  const Model = type === "POST" ? SafePlacePost : SafePlaceComment;
  const content = await Model.findOne({
    _id: id,
    status: { $in: ["VISIBLE", "PENDING_CORRECTION", "PENDING_REVIEW"] },
  });
  if (!content)
    throw safePlaceError(
      "Ce contenu ne peut pas être masqué.",
      "SAFE_PLACE_CONTENT_NOT_AVAILABLE",
      404,
    );
  const previous = {
    title: content.title,
    content: content.content,
    status: content.status,
  };
  content.status = "MODERATED";
  content.moderatedAt = new Date();
  await content.save();
  if (type === "COMMENT" && !content.parent)
    await SafePlaceComment.updateMany(
      { parent: content._id, status: "VISIBLE" },
      { $set: { status: "MODERATED", moderatedAt: new Date() } },
    );
  await SafePlaceContentRevision.create({
    targetType: type,
    targetId: id,
    actor: admin._id,
    actorRole: "ADMIN",
    pseudonymSnapshot: "Mélanie",
    action: "MODERATED",
    previousVersion: previous,
    newVersion: { status: "MODERATED" },
    reason,
  });
  await modLog(admin, type, id, "CONTENT_HIDDEN", reason);
  await createNotification({
    recipient: content.author,
    actor: admin._id,
    type: "SAFE_PLACE_MODERATION",
    title: "Contenu modéré",
    message: reason,
    targetType: type,
    targetId: id,
  });
  return content;
}

async function restoreContent(type, id, admin, reason) {
  const Model = type === "POST" ? SafePlacePost : SafePlaceComment;
  const content = await Model.findOne({ _id: id, status: "MODERATED" });
  if (!content)
    throw safePlaceError(
      "Ce contenu ne peut pas être restauré.",
      "SAFE_PLACE_CONTENT_NOT_RESTORABLE",
      409,
    );
  content.status = "VISIBLE";
  content.moderatedAt = null;
  await content.save();
  await SafePlaceContentRevision.create({
    targetType: type,
    targetId: id,
    actor: admin._id,
    actorRole: "ADMIN",
    pseudonymSnapshot: "Mélanie",
    action: "RESTORED",
    previousVersion: { status: "MODERATED" },
    newVersion: { status: "VISIBLE" },
    reason,
  });
  await modLog(admin, type, id, "CONTENT_RESTORED", reason);
  return content;
}

async function applyPostCorrection(content) {
  const oldIds = content.images.map((image) => String(image.media));
  const newImages = content.correctionDraft.images || [];
  const newIds = newImages.map((image) => String(image.media));
  content.title = content.correctionDraft.title;
  content.content = content.correctionDraft.content;
  content.links = content.correctionDraft.links || [];
  content.images = newImages;
  content.correctionDraft = undefined;
  if (newIds.length)
    await MediaAsset.updateMany(
      { _id: { $in: newIds } },
      {
        $set: {
          status: "ACTIVE",
          safePlacePost: content._id,
          visibility: "MEMBERS_ONLY",
        },
      },
    );
  const replaced = oldIds.filter((id) => !newIds.includes(id));
  if (replaced.length)
    await MediaAsset.updateMany(
      { _id: { $in: replaced } },
      { $set: { status: "REPLACED" } },
    );
}

async function correctionDecision(type, id, admin, data) {
  const Model = type === "POST" ? SafePlacePost : SafePlaceComment;
  const content = await Model.findOne({ _id: id, status: "PENDING_REVIEW" });
  if (!content)
    throw safePlaceError(
      "Aucune correction n’est en attente.",
      "SAFE_PLACE_CORRECTION_NOT_PENDING",
      409,
    );
  if (data.decision === "APPROVE") {
    if (type === "POST") await applyPostCorrection(content);
    else {
      content.content = content.correctionDraft;
      content.correctionDraft = null;
    }
    content.status = "VISIBLE";
    content.correctionRequest = undefined;
    content.editedAt = new Date();
    await content.save();
    await createNotification({
      recipient: content.author,
      actor: admin._id,
      type: "SAFE_PLACE_CORRECTION_APPROVED",
      title: "Correction approuvée",
      message: "Mélanie a approuvé ta correction.",
      targetType: type,
      targetId: id,
    });
  } else if (data.decision === "REQUEST_CHANGES") {
    content.status = "PENDING_CORRECTION";
    content.correctionRequest = {
      message: data.comment,
      requestedAt: new Date(),
      requestedBy: admin._id,
    };
    await content.save();
    await createNotification({
      recipient: content.author,
      actor: admin._id,
      type: "SAFE_PLACE_CORRECTION_REQUESTED",
      title: "Nouvelle correction demandée",
      message: data.comment || "Mélanie demande une nouvelle correction.",
      targetType: type,
      targetId: id,
    });
  } else {
    content.status = "MODERATED";
    content.moderatedAt = new Date();
    await content.save();
  }
  await SafePlaceContentRevision.create({
    targetType: type,
    targetId: id,
    actor: admin._id,
    actorRole: "ADMIN",
    pseudonymSnapshot: "Mélanie",
    action: `CORRECTION_${data.decision}`,
    previousVersion: { status: "PENDING_REVIEW" },
    newVersion: {
      status: content.status,
      content: data.decision === "APPROVE" ? content.content : undefined,
    },
    reason: data.comment,
  });
  const reportUpdate = {
    $set: {
      status:
        data.decision === "REQUEST_CHANGES" ? "WAITING_CORRECTION" : "RESOLVED",
      resolution: `CORRECTION_${data.decision}`,
      adminComment: data.comment,
      resolvedBy: admin._id,
      resolvedAt: data.decision === "REQUEST_CHANGES" ? null : new Date(),
    },
  };
  if (data.decision !== "REQUEST_CHANGES")
    reportUpdate.$unset = { openDedupeKey: "" };
  await SafePlaceReport.updateMany(
    { targetType: type, targetId: id, status: "WAITING_CORRECTION" },
    reportUpdate,
  );
  await modLog(admin, type, id, `CORRECTION_${data.decision}`, data.comment);
  return content;
}

async function requestCorrection(type, id, admin, reason) {
  const Model = type === "POST" ? SafePlacePost : SafePlaceComment;
  const content = await Model.findOne({
    _id: id,
    status: { $in: ["VISIBLE", "PENDING_REVIEW"] },
  });
  if (!content)
    throw safePlaceError(
      "Ce contenu ne peut pas être envoyé en correction.",
      "SAFE_PLACE_CONTENT_NOT_AVAILABLE",
      409,
    );
  const previousStatus = content.status;
  content.status = "PENDING_CORRECTION";
  content.correctionRequest = {
    message: reason,
    requestedAt: new Date(),
    requestedBy: admin._id,
  };
  await content.save();
  await SafePlaceContentRevision.create({
    targetType: type,
    targetId: id,
    actor: admin._id,
    actorRole: "ADMIN",
    pseudonymSnapshot: "Mélanie",
    action: "CORRECTION_REQUESTED",
    previousVersion: { status: previousStatus },
    newVersion: { status: "PENDING_CORRECTION" },
    reason,
  });
  await modLog(admin, type, id, "CORRECTION_REQUESTED", reason);
  await createNotification({
    recipient: content.author,
    actor: admin._id,
    type: "SAFE_PLACE_CORRECTION_REQUESTED",
    title: "Correction demandée",
    message: reason,
    targetType: type,
    targetId: id,
  });
  return content;
}

async function history(type, id) {
  const [revisions, moderation] = await Promise.all([
    SafePlaceContentRevision.find({ targetType: type, targetId: id })
      .populate("actor", "pseudonym role")
      .sort({ createdAt: -1 })
      .lean(),
    SafePlaceModerationLog.find({ targetType: type, targetId: id })
      .populate("admin", "pseudonym")
      .sort({ createdAt: -1 })
      .lean(),
  ]);
  return { revisions, moderation };
}
module.exports = {
  postAction,
  move,
  warning,
  removeWarning,
  hideContent,
  restoreContent,
  correctionDecision,
  requestCorrection,
  history,
};
