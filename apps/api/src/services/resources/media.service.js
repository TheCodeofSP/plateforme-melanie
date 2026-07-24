const crypto = require("crypto");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");
const env = require("../../config/env");
const MediaAsset = require("../../models/MediaAsset");
const Resource = require("../../models/Resource");
const ProfessionalProfile = require("../../models/ProfessionalProfile");
const Webinar = require("../../models/Webinar");
const Communication = require("../../models/Communication");
const { createResourceError } = require("../../utils/resource.utils");

function configureCloudinary() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw createResourceError("Cloudinary n’est pas encore configuré.", "MEDIA_STORAGE_NOT_CONFIGURED", 503);
  }
  cloudinary.config({ cloud_name: env.CLOUDINARY_CLOUD_NAME, api_key: env.CLOUDINARY_API_KEY, api_secret: env.CLOUDINARY_API_SECRET, secure: true });
}

function cloudinaryTypes(purpose) {
  if (["COVER", "PROFILE_PHOTO", "WEBINAR_IMAGE", "COMMUNICATION_IMAGE"].includes(purpose)) return { resourceType: "image", deliveryType: "upload" };
  if (purpose === "PDF") return { resourceType: "raw", deliveryType: "authenticated" };
  return { resourceType: "video", deliveryType: "authenticated" };
}

function safeBaseName(fileName) {
  const extension = path.extname(fileName);
  return path.basename(fileName, extension).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-").slice(0, 60) || "media";
}

async function authorizeUpload(user, data) {
  configureCloudinary();
  if (data.resourceId) {
    const resource = await Resource.findById(data.resourceId);
    if (!resource || (user.role !== "ADMIN" && resource.owner.toString() !== user._id.toString())) throw createResourceError("Cette ressource ne t’appartient pas.", "RESOURCE_FORBIDDEN", 403);
  }
  const { resourceType, deliveryType } = cloudinaryTypes(data.purpose);
  const folder = data.purpose === "PROFILE_PHOTO" ? "professionals" : data.purpose === "WEBINAR_IMAGE" ? "webinars" : data.purpose === "COMMUNICATION_IMAGE" ? "communications" : "resources";
  const publicId = `${env.CLOUDINARY_FOLDER_PREFIX}/${folder}/${user._id}/${data.purpose.toLowerCase()}/${safeBaseName(data.fileName)}-${crypto.randomUUID()}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const signatureParams = { public_id: publicId, timestamp, type: deliveryType };
  const signature = cloudinary.utils.api_sign_request(signatureParams, env.CLOUDINARY_API_SECRET);
  const media = await MediaAsset.create({ owner: user._id, resource: data.resourceId || null, purpose: data.purpose, storageKey: publicId, originalName: data.fileName, mimeType: data.mimeType, size: data.size, resourceType, deliveryType });
  return {
    media,
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    uploadFields: { api_key: env.CLOUDINARY_API_KEY, timestamp, public_id: publicId, type: deliveryType, signature },
    expiresIn: 600,
  };
}

function signaturesMatch(received, expected) {
  const a = Buffer.from(received); const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function confirmUpload(user, data) {
  configureCloudinary();
  const media = await MediaAsset.findOne({ _id: data.mediaId, owner: user._id, status: "PENDING" });
  if (!media) throw createResourceError("Ce média ne peut pas être confirmé.", "MEDIA_NOT_CONFIRMABLE", 404);
  const expectedSignature = cloudinary.utils.api_sign_request({ public_id: data.publicId, version: data.version }, env.CLOUDINARY_API_SECRET);
  if (!signaturesMatch(data.signature, expectedSignature) || data.publicId !== media.storageKey || data.resourceType !== media.resourceType) {
    throw createResourceError("La réponse Cloudinary n’est pas authentique ou ne correspond pas au média attendu.", "MEDIA_MISMATCH", 400);
  }
  if (data.bytes > media.size) throw createResourceError("Le fichier dépasse la taille annoncée.", "MEDIA_SIZE_MISMATCH", 400);
  media.size = data.bytes; media.providerVersion = data.version; media.providerFormat = data.format; media.confirmedAt = new Date();
  await media.save(); return media;
}

async function findActiveResource(media) {
  return Resource.findOne({
    ...require("./resource.service").activePublicationFilter(),
    $or: [{ "publishedVersion.coverMedia": media._id }, { "publishedVersion.media": media._id }, { "publishedVersion.pdf": media._id }],
  });
}

async function accessMedia(mediaId, user, disposition = "inline") {
  configureCloudinary();
  const media = await MediaAsset.findOne({ _id: mediaId, status: { $in: ["PENDING", "ACTIVE"] } });
  if (!media) throw createResourceError("Ce média n’est pas disponible.", "MEDIA_NOT_FOUND", 404);
  if (!media.confirmedAt) throw createResourceError("Ce média n’a pas été confirmé.", "MEDIA_NOT_CONFIRMED", 409);
  if (media.status === "PENDING" && (!user || (user.role !== "ADMIN" && media.owner.toString() !== user._id.toString()))) throw createResourceError("Accès interdit.", "FORBIDDEN", 403);
  let activeResource = null;
  if (media.status === "ACTIVE") {
    activeResource = await findActiveResource(media);
    if (!activeResource) {
      const isPublicProfilePhoto = media.purpose === "PROFILE_PHOTO" && await ProfessionalProfile.exists({ publicationStatus: "PUBLISHED", isActive: true, "publishedVersion.photo": media._id });
      const isPublicWebinarImage = media.purpose === "WEBINAR_IMAGE" && await Webinar.exists({ image: media._id, status: { $in: ["PUBLISHED", "COMPLETED"] } });
      const isCommunicationImage = media.purpose === "COMMUNICATION_IMAGE" && await Communication.exists({ _id: media.communication, status: { $in: ["SENDING", "SENT"] } });
      const previewAllowed = user && (user.role === "ADMIN" || media.owner.toString() === user._id.toString());
      if (!isPublicProfilePhoto && !isPublicWebinarImage && !isCommunicationImage && !previewAllowed) throw createResourceError("Ce média n’est pas disponible.", "MEDIA_NOT_AVAILABLE", 404);
    } else if (activeResource.finalVisibility === "MEMBERS_ONLY" && media.purpose !== "COVER" && !user) {
      throw createResourceError("Authentification requise.", "AUTHENTICATION_REQUIRED", 401);
    }
  }
  let url;
  let expiresIn = null;
  if (media.deliveryType === "upload") {
    url = cloudinary.url(media.storageKey, { resource_type: media.resourceType, type: media.deliveryType, version: media.providerVersion, format: media.providerFormat, secure: true });
  } else {
    const expiresAt = Math.floor(Date.now() / 1000) + 300;
    url = cloudinary.utils.private_download_url(media.storageKey, media.providerFormat, { resource_type: media.resourceType, type: media.deliveryType, expires_at: expiresAt, attachment: disposition === "attachment" });
    expiresIn = 300;
  }
  return { url, expiresIn, resourceId: activeResource?._id || null };
}

async function destroyAsset(media) {
  configureCloudinary();
  return cloudinary.uploader.destroy(media.storageKey, { resource_type: media.resourceType, type: media.deliveryType, invalidate: true });
}

async function deleteMedia(mediaId, user) {
  const media = await MediaAsset.findById(mediaId);
  if (!media || (user.role !== "ADMIN" && media.owner.toString() !== user._id.toString())) throw createResourceError("Ce média ne peut pas être supprimé.", "MEDIA_NOT_DELETABLE", 404);
  const inUse = await Resource.exists({ $or: [
    { "publishedVersion.coverMedia": media._id }, { "publishedVersion.media": media._id }, { "publishedVersion.pdf": media._id },
    { "workingVersion.coverMedia": media._id }, { "workingVersion.media": media._id }, { "workingVersion.pdf": media._id },
  ] });
  const inProfile = media.purpose === "PROFILE_PHOTO" && await ProfessionalProfile.exists({ $or: [{ "draftVersion.photo": media._id }, { "publishedVersion.photo": media._id }] });
  const inWebinar = media.purpose === "WEBINAR_IMAGE" && await Webinar.exists({ image: media._id });
  const inCommunication = media.purpose === "COMMUNICATION_IMAGE" && await Communication.exists({ $or: [{ mainImage: media._id }, { "blocks.image": media._id }, { "frozenSnapshot.mainImage": media._id }, { "frozenSnapshot.blocks.image": media._id }] });
  if (inUse || inProfile || inWebinar || inCommunication) throw createResourceError("Ce média est encore utilisé.", "MEDIA_IN_USE", 409);
  await destroyAsset(media); media.status = "DELETED"; media.deletedAt = new Date(); await media.save(); return media;
}

async function cleanupReplacedMedia(limit = 100) {
  const abandonedBefore = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const media = await MediaAsset.find({ $or: [{ status: "REPLACED" }, { status: "PENDING", confirmedAt: null, createdAt: { $lte: abandonedBefore } }] }).limit(limit);
  for (const asset of media) { await destroyAsset(asset); asset.status = "DELETED"; asset.deletedAt = new Date(); await asset.save(); }
  return media.length;
}

module.exports = { authorizeUpload, confirmUpload, accessMedia, deleteMedia, cleanupReplacedMedia };
