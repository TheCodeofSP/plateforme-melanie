const Resource = require("../../models/Resource");
const ProfessionalProfile = require("../../models/ProfessionalProfile");
const ResourceWorkflowLog = require("../../models/ResourceWorkflowLog");
const MediaAsset = require("../../models/MediaAsset");
const {
  completeResourceVersionSchema,
} = require("../../validations/resource.validation");
const { createManagementNotification } = require("../notification.service");
const {
  createResourceError,
  slugify,
  escapeRegex,
} = require("../../utils/resource.utils");
const { assertNoSolicitation } = require("../professionalProfile.service");

function validateIntervenantContent(user, version) {
  if (user.role !== "INTERVENANT") return;
  assertNoSolicitation({
    professionalName: version.title,
    profession: version.description,
    specialties: version.keywords || [],
    shortPresentation: (version.blocks || [])
      .map((block) =>
        [block.text, ...(block.items || [])].filter(Boolean).join(" "),
      )
      .join(" "),
    biography: "",
  });
}

async function log(resource, actor, action, reason = null, metadata = {}) {
  return ResourceWorkflowLog.create({
    resource,
    actor: actor._id,
    actorRole: actor.role,
    action,
    reason,
    metadata,
  });
}

async function uniqueSlug(title, excludedId) {
  const base = slugify(title) || "ressource";
  let value = base;
  for (
    let suffix = 2;
    await Resource.exists({
      slug: value,
      ...(excludedId && { _id: { $ne: excludedId } }),
    });
    suffix += 1
  )
    value = `${base}-${suffix}`;
  return value;
}

async function getOwnedResource(resourceId, user, editable = false) {
  const resource = await Resource.findById(resourceId);
  if (!resource)
    throw createResourceError(
      "Cette ressource n’existe pas.",
      "RESOURCE_NOT_FOUND",
      404,
    );
  if (resource.owner.toString() !== user._id.toString())
    throw createResourceError(
      "Tu ne peux agir que sur tes propres ressources.",
      "RESOURCE_FORBIDDEN",
      403,
    );
  if (editable && resource.publicationStatus === "ARCHIVED")
    throw createResourceError(
      "Une ressource archivée ne peut plus être modifiée.",
      "RESOURCE_ARCHIVED",
      409,
    );
  return resource;
}

async function validateVersionMedia(version, user) {
  const requirements = [
    [version.coverMedia, "COVER"],
    [version.pdf, "PDF"],
    [version.media, version.format === "VIDEO" ? "VIDEO" : "AUDIO"],
  ].filter(([id]) => id);
  for (const [id, purpose] of requirements) {
    const asset = await MediaAsset.findOne({
      _id: id,
      owner: user._id,
      purpose,
      status: { $in: ["PENDING", "ACTIVE"] },
      confirmedAt: { $ne: null },
    });
    if (!asset)
      throw createResourceError(
        "Un média est invalide, non confirmé ou ne t’appartient pas.",
        "INVALID_RESOURCE_MEDIA",
        400,
        { mediaId: id, purpose },
      );
  }
}

async function activateVersionMedia(resource, oldVersion = null) {
  const currentIds = [
    resource.publishedVersion?.coverMedia,
    resource.publishedVersion?.media,
    resource.publishedVersion?.pdf,
  ]
    .filter(Boolean)
    .map(String);
  const oldIds = [oldVersion?.coverMedia, oldVersion?.media, oldVersion?.pdf]
    .filter(Boolean)
    .map(String);
  if (currentIds.length)
    await MediaAsset.updateMany(
      { _id: { $in: currentIds } },
      {
        status: "ACTIVE",
        resource: resource._id,
        visibility: resource.finalVisibility,
      },
    );
  const replaced = oldIds.filter((id) => !currentIds.includes(id));
  if (replaced.length)
    await MediaAsset.updateMany(
      { _id: { $in: replaced } },
      { status: "REPLACED" },
    );
  return replaced;
}

async function createResource(user, initial = {}) {
  let professionalProfile = null;
  if (user.role === "INTERVENANT") {
    professionalProfile = await ProfessionalProfile.findOne({
      user: user._id,
      isActive: true,
      publicationStatus: "PUBLISHED",
    });
    if (!professionalProfile)
      throw createResourceError(
        "Ton profil professionnel actif est requis.",
        "PROFESSIONAL_PROFILE_REQUIRED",
        403,
      );
  }
  const resource = await Resource.create({
    owner: user._id,
    authorRole: user.role,
    professionalProfile: professionalProfile?._id,
    workingVersion: initial.workingVersion || {},
  });
  await log(resource._id, user, "DRAFT_CREATED");
  return resource;
}

async function updateDraft(resourceId, user, changes) {
  const resource = await getOwnedResource(resourceId, user, true);
  if (resource.reviewStatus === "PENDING_REVIEW")
    throw createResourceError(
      "La version soumise ne peut pas être modifiée.",
      "RESOURCE_PENDING_REVIEW",
      409,
    );
  const current =
    resource.workingVersion?.toObject?.() || resource.workingVersion || {};
  const nextVersion = { ...current, ...changes };
  validateIntervenantContent(user, nextVersion);
  await validateVersionMedia(nextVersion, user);
  resource.workingVersion = nextVersion;
  resource.reviewStatus =
    resource.reviewStatus === "CHANGES_REQUESTED"
      ? "CHANGES_REQUESTED"
      : "NOT_SUBMITTED";
  await resource.save();
  await log(resource._id, user, "DRAFT_UPDATED");
  return resource;
}

async function startRevision(resourceId, user) {
  const resource = await getOwnedResource(resourceId, user, true);
  if (
    !resource.publishedVersion ||
    !["PUBLISHED", "UNPUBLISHED", "SCHEDULED"].includes(
      resource.publicationStatus,
    )
  )
    throw createResourceError(
      "Aucune version publiée ne peut être modifiée.",
      "RESOURCE_NOT_PUBLISHED",
      409,
    );
  if (resource.workingVersion?.title)
    throw createResourceError(
      "Une version de travail existe déjà.",
      "REVISION_ALREADY_EXISTS",
      409,
    );
  resource.workingVersion = resource.publishedVersion.toObject();
  resource.reviewStatus = "NOT_SUBMITTED";
  await resource.save();
  await log(resource._id, user, "REVISION_STARTED");
  return resource;
}

function validateComplete(resource) {
  const result = completeResourceVersionSchema.safeParse(
    resource.workingVersion?.toObject?.() || resource.workingVersion,
  );
  if (!result.success)
    throw createResourceError(
      "La ressource est incomplète.",
      "RESOURCE_INCOMPLETE",
      400,
      {
        errors: result.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
    );
  return result.data;
}

async function submitResource(resourceId, user) {
  if (user.role !== "INTERVENANT")
    throw createResourceError(
      "Cette action est réservée aux intervenantes.",
      "FORBIDDEN",
      403,
    );
  const resource = await getOwnedResource(resourceId, user, true);
  if (resource.reviewStatus === "PENDING_REVIEW")
    throw createResourceError(
      "Cette version est déjà en attente.",
      "RESOURCE_ALREADY_SUBMITTED",
      409,
    );
  validateComplete(resource);
  validateIntervenantContent(user, resource.workingVersion);
  await validateVersionMedia(resource.workingVersion, user);
  resource.reviewStatus = "PENDING_REVIEW";
  resource.correctionRequest = undefined;
  await resource.save();
  await log(resource._id, user, "SUBMITTED_FOR_REVIEW");
  await createManagementNotification({
    scope: "RESOURCES",
    type: "ADMIN_RESOURCE_SUBMISSION",
    title: "Ressource à examiner",
    message: `Une ressource intitulée « ${resource.workingVersion.title} » a été soumise.`,
    targetType: "RESOURCE",
    targetId: resource._id,
    actionPath: `/admin/resources/${resource._id}`,
    deduplicationKey: `admin-resource-submission:${resource._id}:${resource.updatedAt.getTime()}`,
  });
  return resource;
}

async function publishAdminResource(
  resourceId,
  admin,
  { visibility, scheduledFor, comment },
) {
  const resource = await getOwnedResource(resourceId, admin, true);
  if (admin.role !== "ADMIN")
    throw createResourceError(
      "Action réservée à l’administratrice.",
      "FORBIDDEN",
      403,
    );
  const complete = validateComplete(resource);
  await validateVersionMedia(resource.workingVersion, admin);
  const oldVersion =
    resource.publishedVersion?.toObject?.() || resource.publishedVersion;
  const now = new Date();
  const schedule = scheduledFor ? new Date(scheduledFor) : null;
  resource.publishedVersion = complete;
  resource.workingVersion = undefined;
  resource.finalVisibility = visibility || complete.proposedVisibility;
  resource.scheduledFor = schedule;
  resource.publicationStatus =
    schedule && schedule > now ? "SCHEDULED" : "PUBLISHED";
  resource.reviewStatus = "APPROVED";
  resource.slug = await uniqueSlug(complete.title, resource._id);
  resource.firstPublishedAt ||= schedule || now;
  resource.lastPublishedAt = schedule || now;
  await resource.save();
  const replaced = await activateVersionMedia(resource, oldVersion);
  await log(resource._id, admin, "ADMIN_PUBLISHED", comment, {
    visibility: resource.finalVisibility,
    scheduledFor: schedule,
    replacedMedia: replaced,
  });
  return resource;
}

async function listMine(user, query = {}) {
  const filter =
    user.role === "ADMIN" && query.all === "true" ? {} : { owner: user._id };
  if (query.publicationStatus)
    filter.publicationStatus = query.publicationStatus;
  if (query.reviewStatus) filter.reviewStatus = query.reviewStatus;
  return Resource.find(filter).sort({ updatedAt: -1 }).lean();
}

function activePublicationFilter(now = new Date()) {
  return {
    $or: [
      { publicationStatus: "PUBLISHED" },
      { publicationStatus: "SCHEDULED", scheduledFor: { $lte: now } },
    ],
  };
}

function publicProjection(resource, user) {
  const data = resource.toObject ? resource.toObject() : resource;
  const locked = data.finalVisibility === "MEMBERS_ONLY" && !user;
  const fullVersion = { ...data.publishedVersion };
  const version = locked
    ? {
        title: fullVersion.title,
        description: fullVersion.description,
        format: fullVersion.format,
        coverMedia: fullVersion.coverMedia,
        coverUrl: fullVersion.coverUrl,
        coverAlt: fullVersion.coverAlt,
        coverCredit: fullVersion.coverCredit,
        coverCaption: fullVersion.coverCaption,
      }
    : fullVersion;
  return {
    _id: data._id,
    slug: data.slug,
    publicationStatus:
      data.publicationStatus === "SCHEDULED"
        ? "PUBLISHED"
        : data.publicationStatus,
    visibility: data.finalVisibility,
    locked,
    publishedAt: fullVersion.originalPublishedAt || data.lastPublishedAt,
    counters: locked ? undefined : data.counters,
    content: version,
    author: {
      ...data.authorDisplay,
      ...(fullVersion.authorName && { name: fullVersion.authorName }),
    },
  };
}

async function withAuthorDisplay(resources) {
  const array = Array.isArray(resources) ? resources : [resources];
  await Promise.all(
    array.map(async (resource) => {
      const owner = resource.owner;
      if (resource.authorRole === "ADMIN")
        resource.authorDisplay = {
          name: owner?.pseudonym || "Mélanie",
          role: "ADMIN",
        };
      else {
        const profile = resource.professionalProfile;
        const published = profile?.publishedVersion;
        resource.authorDisplay =
          profile?.isActive &&
          profile?.publicationStatus === "PUBLISHED" &&
          published
            ? {
                profileId: profile._id,
                name: published.professionalName,
                displayedFirstName: published.displayedFirstName,
                displayedLastName: published.displayedLastName,
                profession: published.profession,
                specialties: published.specialties,
                photo: published.photo,
                website: published.website,
                role: "INTERVENANT",
              }
            : {
                name: `Ancienne intervenante — ${published?.profession || "Professionnelle"}`,
                profession: published?.profession || null,
                role: "FORMER_INTERVENANT",
              };
      }
    }),
  );
  return resources;
}

function buildListFilter(query) {
  const filter = activePublicationFilter();
  if (query.format)
    filter["publishedVersion.format"] = {
      $in: String(query.format).split(","),
    };
  if (query.category)
    filter["publishedVersion.categories"] = {
      $in: String(query.category).split(","),
    };
  if (query.q) {
    const regex = new RegExp(escapeRegex(query.q.trim()), "i");
    filter.$and = [
      {
        $or: [
          { "publishedVersion.title": regex },
          { "publishedVersion.description": regex },
          { "publishedVersion.keywords": regex },
          { "publishedVersion.blocks.text": regex },
          { "publishedVersion.categories": regex },
        ],
      },
    ];
  }
  return filter;
}

async function listPublicResources(query, user) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 12, 1), 50);
  const sorts = {
    newest: { lastPublishedAt: -1 },
    oldest: { lastPublishedAt: 1 },
    popular: { "counters.views": -1 },
    liked: { "counters.likes": -1 },
  };
  const filter = buildListFilter(query);
  const [items, total] = await Promise.all([
    Resource.find(filter)
      .populate("owner", "pseudonym")
      .populate("professionalProfile")
      .sort(sorts[query.sort] || sorts.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Resource.countDocuments(filter),
  ]);
  await withAuthorDisplay(items);
  return {
    items: items.map((r) => publicProjection(r, user)),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

async function getPublicResource(slug, user) {
  const resource = await Resource.findOne({
    slug,
    ...activePublicationFilter(),
  })
    .populate("owner", "pseudonym")
    .populate("professionalProfile")
    .lean();
  if (!resource)
    throw createResourceError(
      "Cette ressource n’existe pas.",
      "RESOURCE_NOT_FOUND",
      404,
    );
  await withAuthorDisplay(resource);
  return publicProjection(resource, user);
}

async function getRelated(resourceId, user) {
  const source = await Resource.findById(resourceId).lean();
  if (!source?.publishedVersion)
    throw createResourceError(
      "Cette ressource n’existe pas.",
      "RESOURCE_NOT_FOUND",
      404,
    );
  const profile = user?.currentSpmProfile;
  const items = await Resource.find({
    _id: { $ne: resourceId },
    ...activePublicationFilter(),
    $or: [
      {
        "publishedVersion.categories": {
          $in: source.publishedVersion.categories,
        },
      },
      ...(profile && profile !== "NON_DEFINI"
        ? [{ "publishedVersion.recommendedSpmProfiles": profile }]
        : []),
      { "publishedVersion.format": source.publishedVersion.format },
    ],
  })
    .populate("owner", "pseudonym")
    .populate("professionalProfile")
    .sort({ lastPublishedAt: -1 })
    .limit(3)
    .lean();
  await withAuthorDisplay(items);
  return items.map((r) => publicProjection(r, user));
}

async function getRecommendations(user, limit = 6) {
  const filter = activePublicationFilter();
  if (user.currentSpmProfile && user.currentSpmProfile !== "NON_DEFINI")
    filter.$and = [
      {
        $or: [
          { "publishedVersion.recommendedSpmProfiles": user.currentSpmProfile },
          { "publishedVersion.recommendedSpmProfiles": { $size: 0 } },
        ],
      },
    ];
  const items = await Resource.find(filter)
    .populate("owner", "pseudonym")
    .populate("professionalProfile")
    .sort(
      user.currentSpmProfile === "NON_DEFINI"
        ? { "counters.views": -1, lastPublishedAt: -1 }
        : { lastPublishedAt: -1 },
    )
    .limit(Math.min(limit, 20))
    .lean();
  await withAuthorDisplay(items);
  return items.map((r) => publicProjection(r, user));
}

async function getHistory(resourceId, user) {
  const resource = await Resource.findById(resourceId);
  if (!resource)
    throw createResourceError(
      "Cette ressource n’existe pas.",
      "RESOURCE_NOT_FOUND",
      404,
    );
  if (
    user.role !== "ADMIN" &&
    resource.owner.toString() !== user._id.toString()
  )
    throw createResourceError("Accès interdit.", "FORBIDDEN", 403);
  return ResourceWorkflowLog.find({ resource: resourceId })
    .populate("actor", "pseudonym role")
    .sort({ createdAt: 1 })
    .lean();
}

module.exports = {
  log,
  uniqueSlug,
  getOwnedResource,
  createResource,
  updateDraft,
  startRevision,
  submitResource,
  publishAdminResource,
  listMine,
  listPublicResources,
  getPublicResource,
  getRelated,
  getRecommendations,
  getHistory,
  activePublicationFilter,
  validateVersionMedia,
  activateVersionMedia,
};
