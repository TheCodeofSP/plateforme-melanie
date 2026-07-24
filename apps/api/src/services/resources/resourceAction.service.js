const Resource = require("../../models/Resource");
const ResourceActionRequest = require("../../models/ResourceActionRequest");
const MediaAsset = require("../../models/MediaAsset");
const { getOwnedResource, log } = require("./resource.service");
const { notifyOwner } = require("./resourceNotification.service");
const { createResourceError } = require("../../utils/resource.utils");
const { createManagementNotification } = require("../notification.service");

async function createActionRequest(resourceId, user, data) {
  const resource = await getOwnedResource(resourceId, user);
  if (user.role !== "INTERVENANT" || resource.authorRole !== "INTERVENANT") throw createResourceError("Action réservée aux intervenantes.", "FORBIDDEN", 403);
  if (!resource.publishedVersion || resource.publicationStatus === "ARCHIVED") throw createResourceError("Cette action n’est pas disponible.", "ACTION_NOT_AVAILABLE", 409);
  if (data.type === "UNPUBLISH" && !["PUBLISHED", "SCHEDULED"].includes(resource.publicationStatus)) throw createResourceError("Cette ressource est déjà dépubliée.", "ACTION_NOT_AVAILABLE", 409);
  if (await ResourceActionRequest.exists({ resource: resourceId, type: data.type, status: "PENDING" })) throw createResourceError("Une demande identique est déjà en attente.", "ACTION_REQUEST_EXISTS", 409);
  const request = await ResourceActionRequest.create({ resource: resourceId, requestedBy: user._id, ...data });
  await log(resourceId, user, `${data.type}_REQUESTED`, data.reason);
  await createManagementNotification({
    scope: "RESOURCES",
    type: "ADMIN_RESOURCE_ACTION_REQUEST",
    title: "Demande concernant une ressource",
    message: `Une demande de ${data.type === "ARCHIVE" ? "classement" : "dépublication"} doit être traitée.`,
    targetType: "RESOURCE",
    targetId: resource._id,
    actionPath: `/admin/resources/${resource._id}`,
    deduplicationKey: `admin-resource-action:${request._id}`,
  });
  return request;
}

async function listAdminActionRequests(query = {}) {
  const page = query.page || 1; const limit = query.limit || 20; const filter = { ...(query.status && { status: query.status }), ...(query.type && { type: query.type }) };
  const [requests, total] = await Promise.all([
    ResourceActionRequest.find(filter).populate("resource", "slug publishedVersion.title publicationStatus").populate("requestedBy", "pseudonym").sort({ createdAt: query.sort === "newest" ? -1 : 1 }).skip((page - 1) * limit).limit(limit).lean(),
    ResourceActionRequest.countDocuments(filter),
  ]); return { requests, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function listMyActionRequests(resourceId, user) {
  await getOwnedResource(resourceId, user);
  return ResourceActionRequest.find({ resource: resourceId, requestedBy: user._id }).sort({ createdAt: -1 }).lean();
}

async function decideActionRequest(requestId, admin, approved, comment) {
  const request = await ResourceActionRequest.findOne({ _id: requestId, status: "PENDING" });
  if (!request) throw createResourceError("Cette demande n’est plus en attente.", "ACTION_REQUEST_NOT_FOUND", 404);
  const resource = await Resource.findById(request.resource);
  if (!resource) throw createResourceError("Cette ressource n’existe plus.", "RESOURCE_NOT_FOUND", 404);
  request.status = approved ? "APPROVED" : "REJECTED"; request.decidedBy = admin._id; request.decisionComment = comment; request.decidedAt = new Date();
  if (approved) {
    resource.publicationStatus = request.type === "ARCHIVE" ? "ARCHIVED" : "UNPUBLISHED";
    if (request.type === "ARCHIVE") resource.archivedAt = new Date(); else resource.unpublishedAt = new Date();
    await resource.save();
  }
  await request.save();
  await log(resource._id, admin, `${request.type}_${approved ? "APPROVED" : "REJECTED"}`, comment);
  await notifyOwner(resource, { type: request.type === "ARCHIVE" ? "RESOURCE_ARCHIVED" : "RESOURCE_UNPUBLISHED", subject: `Demande de ${request.type === "ARCHIVE" ? "classement" : "dépublication"}`, title: resource.publishedVersion?.title || "Ressource", message: `Ta demande a été ${approved ? "acceptée" : "refusée"}.`, comment });
  return request;
}

async function republish(resourceId, admin) {
  const resource = await Resource.findOne({ _id: resourceId, publicationStatus: "UNPUBLISHED" });
  if (!resource) throw createResourceError("Cette ressource ne peut pas être remise en ligne.", "RESOURCE_NOT_UNPUBLISHED", 409);
  resource.publicationStatus = "PUBLISHED"; resource.unpublishedAt = null; resource.lastPublishedAt = new Date();
  await resource.save(); await log(resource._id, admin, "REPUBLISHED"); return resource;
}

async function adminSetPublicationStatus(resourceId, admin, status, reason) {
  const resource = await Resource.findById(resourceId);
  if (!resource?.publishedVersion || resource.publicationStatus === "ARCHIVED") throw createResourceError("Cette action n’est pas disponible.", "ACTION_NOT_AVAILABLE", 409);
  resource.publicationStatus = status;
  if (status === "ARCHIVED") resource.archivedAt = new Date(); else resource.unpublishedAt = new Date();
  await resource.save(); await log(resource._id, admin, status, reason); return resource;
}

async function setVisibility(resourceId, admin, visibility, reason) {
  const resource = await Resource.findById(resourceId);
  if (!resource?.publishedVersion || resource.publicationStatus === "ARCHIVED") throw createResourceError("La visibilité ne peut pas être modifiée.", "ACTION_NOT_AVAILABLE", 409);
  const previous = resource.finalVisibility; resource.finalVisibility = visibility; await resource.save();
  const ids = [resource.publishedVersion.coverMedia, resource.publishedVersion.media, resource.publishedVersion.pdf].filter(Boolean);
  if (ids.length) await MediaAsset.updateMany({ _id: { $in: ids } }, { visibility });
  await log(resource._id, admin, "VISIBILITY_CHANGED", reason, { previous, visibility }); return resource;
}

module.exports = { createActionRequest, listMyActionRequests, listAdminActionRequests, decideActionRequest, republish, adminSetPublicationStatus, setVisibility };
