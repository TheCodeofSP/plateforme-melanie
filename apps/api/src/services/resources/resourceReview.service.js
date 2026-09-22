const Resource = require("../../models/Resource");
const {
  completeResourceVersionSchema,
} = require("../../validations/resource.validation");
const { createResourceError } = require("../../utils/resource.utils");
const {
  uniqueSlug,
  log,
  validateVersionMedia,
  activateVersionMedia,
} = require("./resource.service");
const { notifyOwner } = require("./resourceNotification.service");

async function listPendingReviews(query = {}) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const filter = { reviewStatus: "PENDING_REVIEW", authorRole: "INTERVENANT" };
  const [resources, total] = await Promise.all([
    Resource.find(filter)
      .populate("owner", "pseudonym email firstName")
      .populate("professionalProfile")
      .sort({ updatedAt: query.sort === "newest" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Resource.countDocuments(filter),
  ]);
  return {
    resources,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

async function approveResource(
  resourceId,
  admin,
  { visibility, scheduledFor, comment },
) {
  const resource = await Resource.findOne({
    _id: resourceId,
    reviewStatus: "PENDING_REVIEW",
    authorRole: "INTERVENANT",
  });
  if (!resource)
    throw createResourceError(
      "Aucune soumission en attente.",
      "REVIEW_NOT_FOUND",
      404,
    );
  const result = completeResourceVersionSchema.safeParse(
    resource.workingVersion.toObject(),
  );
  if (!result.success)
    throw createResourceError(
      "La ressource soumise est incomplète.",
      "RESOURCE_INCOMPLETE",
      400,
    );
  await validateVersionMedia(resource.workingVersion, { _id: resource.owner });
  const oldVersion =
    resource.publishedVersion?.toObject?.() || resource.publishedVersion;
  const now = new Date();
  const schedule = scheduledFor ? new Date(scheduledFor) : null;
  resource.publishedVersion = result.data;
  resource.workingVersion = undefined;
  resource.finalVisibility = visibility || result.data.proposedVisibility;
  resource.scheduledFor = schedule;
  resource.publicationStatus =
    schedule && schedule > now ? "SCHEDULED" : "PUBLISHED";
  resource.reviewStatus = "APPROVED";
  resource.slug = await uniqueSlug(result.data.title, resource._id);
  resource.firstPublishedAt ||= schedule || now;
  resource.lastPublishedAt = schedule || now;
  resource.correctionRequest = undefined;
  await resource.save();
  const replaced = await activateVersionMedia(resource, oldVersion);
  await log(resource._id, admin, "REVIEW_APPROVED", comment, {
    visibility: resource.finalVisibility,
    scheduledFor: schedule,
    replacedMedia: replaced,
  });
  await notifyOwner(resource, {
    type: "RESOURCE_APPROVED",
    subject: "Ta ressource a été validée",
    title: result.data.title,
    message:
      schedule && schedule > now
        ? "Ta ressource a été validée et sa publication est programmée."
        : "Ta ressource a été validée et publiée.",
    comment,
  });
  return resource;
}

async function requestChanges(resourceId, admin, comment) {
  const resource = await Resource.findOne({
    _id: resourceId,
    authorRole: "INTERVENANT",
    reviewStatus: { $in: ["PENDING_REVIEW", "APPROVED", "NOT_SUBMITTED"] },
  });
  if (!resource)
    throw createResourceError(
      "Cette ressource ne peut pas recevoir une demande de correction.",
      "RESOURCE_NOT_REVIEWABLE",
      404,
    );
  if (!resource.workingVersion?.title && resource.publishedVersion)
    resource.workingVersion = resource.publishedVersion.toObject();
  resource.reviewStatus = "CHANGES_REQUESTED";
  resource.correctionRequest = {
    message: comment,
    requestedAt: new Date(),
    requestedBy: admin._id,
  };
  await resource.save();
  await log(resource._id, admin, "CHANGES_REQUESTED", comment);
  await notifyOwner(resource, {
    type: "RESOURCE_CORRECTION_REQUESTED",
    subject: "Une correction est demandée",
    title:
      resource.workingVersion.title ||
      resource.publishedVersion?.title ||
      "Ressource",
    message: "Mélanie te demande d’apporter une correction à ta ressource.",
    comment,
  });
  return resource;
}

module.exports = { listPendingReviews, approveResource, requestChanges };
