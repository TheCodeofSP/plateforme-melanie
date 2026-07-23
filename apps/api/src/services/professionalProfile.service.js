const ProfessionalProfile = require("../models/ProfessionalProfile");
const ProfessionalProfileWorkflowLog = require("../models/ProfessionalProfileWorkflowLog");
const MediaAsset = require("../models/MediaAsset");

function profileError(message, code, statusCode = 400, details) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
}

const solicitationPatterns = [
  {
    regex: /(?:https?:\/\/)?(?:wa\.me|calendly\.|paypal\.|stripe\.)/i,
    label: "lien de contact, réservation ou paiement",
  },
  {
    regex:
      /\b(?:réserve|réservez|contacte[- ]?moi|contactez[- ]?moi|prends rendez-vous|prenez rendez-vous|code promo|promotion|réduction|tarif|prix)\b/i,
    label: "appel commercial",
  },
  { regex: /(?:\+33|0)[1-9](?:[ .-]?\d{2}){4}/, label: "numéro de téléphone" },
  { regex: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, label: "adresse email" },
];

function assertNoSolicitation(version) {
  const text = [
    version.professionalName,
    version.profession,
    ...(version.specialties || []),
    version.shortPresentation,
    version.biography,
  ]
    .filter(Boolean)
    .join(" ");
  const matches = solicitationPatterns
    .filter(({ regex }) => regex.test(text))
    .map(({ label }) => label);
  if (matches.length)
    throw profileError(
      "Le profil contient un élément de prospection interdit.",
      "PROFESSIONAL_SOLICITATION_FORBIDDEN",
      400,
      { matches },
    );
}

function assertComplete(version) {
  const required = [
    "professionalName",
    "displayedFirstName",
    "displayedLastName",
    "profession",
    "shortPresentation",
    "biography",
  ];
  const missing = required.filter((field) => !version?.[field]?.trim());
  if (!version?.specialties?.length) missing.push("specialties");
  if (missing.length)
    throw profileError(
      "Le profil professionnel est incomplet.",
      "PROFESSIONAL_PROFILE_INCOMPLETE",
      400,
      { fields: missing },
    );
  assertNoSolicitation(version);
}

async function log(profile, actor, action, comment = null, changes = null) {
  return ProfessionalProfileWorkflowLog.create({
    profile: profile._id,
    actor: actor._id,
    action,
    comment,
    changes,
  });
}

async function getMine(user) {
  const profile = await ProfessionalProfile.findOne({
    user: user._id,
  }).populate("draftVersion.photo publishedVersion.photo");
  if (!profile)
    throw profileError(
      "Aucun profil professionnel n’est associé à ce compte.",
      "PROFESSIONAL_PROFILE_NOT_FOUND",
      404,
    );
  return profile;
}

async function updateDraft(user, changes) {
  const profile = await ProfessionalProfile.findOne({ user: user._id });
  if (!profile)
    throw profileError(
      "Profil professionnel introuvable.",
      "PROFESSIONAL_PROFILE_NOT_FOUND",
      404,
    );
  if (profile.reviewStatus === "PENDING_REVIEW")
    throw profileError(
      "Le profil soumis ne peut pas être modifié.",
      "PROFESSIONAL_PROFILE_PENDING_REVIEW",
      409,
    );
  if (changes.photo) {
    const photo = await MediaAsset.findOne({
      _id: changes.photo,
      owner: user._id,
      purpose: "PROFILE_PHOTO",
      confirmedAt: { $ne: null },
      status: { $in: ["PENDING", "ACTIVE"] },
    });
    if (!photo)
      throw profileError(
        "La photo professionnelle est invalide.",
        "INVALID_PROFILE_PHOTO",
        400,
      );
  }
  for (const [key, value] of Object.entries(changes))
    profile.draftVersion[key] = value;
  assertNoSolicitation(profile.draftVersion.toObject());
  await profile.save();
  await log(profile, user, "DRAFT_UPDATED", null, Object.keys(changes));
  return profile;
}

async function submit(user) {
  const profile = await ProfessionalProfile.findOne({ user: user._id });
  if (!profile)
    throw profileError(
      "Profil professionnel introuvable.",
      "PROFESSIONAL_PROFILE_NOT_FOUND",
      404,
    );
  if (profile.reviewStatus === "PENDING_REVIEW")
    throw profileError(
      "Le profil est déjà en attente de validation.",
      "PROFESSIONAL_PROFILE_PENDING_REVIEW",
      409,
    );
  assertComplete(profile.draftVersion.toObject());
  profile.reviewStatus = "PENDING_REVIEW";
  profile.submittedAt = new Date();
  profile.lastAdminComment = null;
  await profile.save();
  await log(profile, user, "SUBMITTED");
  return profile;
}

async function startRevision(user) {
  const profile = await ProfessionalProfile.findOne({ user: user._id });
  if (!profile?.publishedVersion)
    throw profileError(
      "Aucune version publiée ne peut être révisée.",
      "NO_PUBLISHED_PROFILE",
      409,
    );
  if (profile.reviewStatus === "PENDING_REVIEW")
    throw profileError(
      "Une version est déjà en attente.",
      "PROFESSIONAL_PROFILE_PENDING_REVIEW",
      409,
    );
  profile.draftVersion = profile.publishedVersion.toObject();
  profile.reviewStatus = "NOT_SUBMITTED";
  await profile.save();
  await log(profile, user, "REVISION_STARTED");
  return profile;
}

function publicFilter(query = {}) {
  const filter = { publicationStatus: "PUBLISHED", isActive: true };
  if (query.profession)
    filter["publishedVersion.profession"] = query.profession;
  if (query.specialty) filter["publishedVersion.specialties"] = query.specialty;
  if (query.q) filter.$text = { $search: query.q };
  return filter;
}

async function listPublic(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 12, 1), 50);
  const filter = publicFilter(query);
  const [items, total] = await Promise.all([
    ProfessionalProfile.find(filter)
      .select("publishedVersion publicationStatus")
      .populate("publishedVersion.photo")
      .sort({ "publishedVersion.professionalName": 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ProfessionalProfile.countDocuments(filter),
  ]);
  return {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

async function publicDetail(profileId) {
  const profile = await ProfessionalProfile.findOne({
    _id: profileId,
    publicationStatus: "PUBLISHED",
    isActive: true,
  })
    .select("publishedVersion publicationStatus")
    .populate("publishedVersion.photo")
    .lean();
  if (!profile)
    throw profileError(
      "Ce profil professionnel n’est pas disponible.",
      "PROFESSIONAL_PROFILE_NOT_FOUND",
      404,
    );
  return profile;
}

async function listAdmin(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const filter = {};
  if (query.reviewStatus) filter.reviewStatus = query.reviewStatus;
  if (query.publicationStatus)
    filter.publicationStatus = query.publicationStatus;
  const [items, total] = await Promise.all([
    ProfessionalProfile.find(filter)
      .populate("user", "firstName lastName email pseudonym role accountStatus")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ProfessionalProfile.countDocuments(filter),
  ]);
  return {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

async function adminDetail(profileId) {
  const profile = await ProfessionalProfile.findById(profileId)
    .populate("user", "firstName lastName email pseudonym role accountStatus")
    .populate("draftVersion.photo publishedVersion.photo")
    .lean();
  if (!profile)
    throw profileError(
      "Profil professionnel introuvable.",
      "PROFESSIONAL_PROFILE_NOT_FOUND",
      404,
    );
  const history = await ProfessionalProfileWorkflowLog.find({
    profile: profileId,
  })
    .populate("actor", "pseudonym firstName lastName role")
    .sort({ createdAt: -1 })
    .lean();
  return { profile, history };
}

async function approve(profileId, admin, comment) {
  const profile = await ProfessionalProfile.findOne({
    _id: profileId,
    reviewStatus: "PENDING_REVIEW",
  });
  if (!profile)
    throw profileError(
      "Aucun profil en attente.",
      "PROFILE_REVIEW_NOT_FOUND",
      404,
    );
  assertComplete(profile.draftVersion.toObject());
  const previousPhoto = profile.publishedVersion?.photo;
  profile.publishedVersion = profile.draftVersion.toObject();
  profile.reviewStatus = "APPROVED";
  profile.publicationStatus = "PUBLISHED";
  profile.approvedAt = new Date();
  profile.approvedBy = admin._id;
  profile.hiddenAt = null;
  profile.hiddenBy = null;
  profile.lastAdminComment = comment;
  await profile.save();
  if (profile.publishedVersion.photo)
    await MediaAsset.updateOne(
      { _id: profile.publishedVersion.photo },
      { $set: { status: "ACTIVE", visibility: "PUBLIC" } },
    );
  if (
    previousPhoto &&
    previousPhoto.toString() !== profile.publishedVersion.photo?.toString()
  )
    await MediaAsset.updateOne(
      { _id: previousPhoto },
      { $set: { status: "REPLACED" } },
    );
  await log(profile, admin, "APPROVED", comment);
  return profile;
}

async function requestChanges(profileId, admin, comment) {
  const profile = await ProfessionalProfile.findOne({
    _id: profileId,
    reviewStatus: "PENDING_REVIEW",
  });
  if (!profile)
    throw profileError(
      "Aucun profil en attente.",
      "PROFILE_REVIEW_NOT_FOUND",
      404,
    );
  profile.reviewStatus = "CHANGES_REQUESTED";
  profile.lastAdminComment = comment;
  await profile.save();
  await log(profile, admin, "CHANGES_REQUESTED", comment);
  return profile;
}
async function editorialCorrection(profileId, admin, changes, comment) {
  const profile = await ProfessionalProfile.findById(profileId);
  if (!profile?.publishedVersion)
    throw profileError("Aucune fiche publiée.", "NO_PUBLISHED_PROFILE", 409);
  const allowed = [
    "professionalName",
    "displayedFirstName",
    "displayedLastName",
    "profession",
    "specialties",
    "shortPresentation",
    "biography",
    "website",
  ];
  for (const [key, value] of Object.entries(changes)) {
    if (!allowed.includes(key) || key === "photo")
      throw profileError(
        "Cette correction administrative n’est pas autorisée.",
        "EDITORIAL_CORRECTION_FORBIDDEN",
        403,
      );
    profile.publishedVersion[key] = value;
  }
  assertComplete(profile.publishedVersion.toObject());
  await profile.save();
  await log(
    profile,
    admin,
    "EDITORIAL_CORRECTION",
    comment,
    Object.keys(changes),
  );
  return profile;
}
async function hide(profileId, admin, comment) {
  const profile = await ProfessionalProfile.findById(profileId);
  if (!profile)
    throw profileError(
      "Profil introuvable.",
      "PROFESSIONAL_PROFILE_NOT_FOUND",
      404,
    );
  profile.publicationStatus = "HIDDEN";
  profile.hiddenAt = new Date();
  profile.hiddenBy = admin._id;
  profile.lastAdminComment = comment;
  await profile.save();
  await log(profile, admin, "HIDDEN", comment);
  return profile;
}
async function restore(profileId, admin, comment) {
  const profile = await ProfessionalProfile.findOne({
    _id: profileId,
    publicationStatus: "HIDDEN",
    publishedVersion: { $ne: null },
  });
  if (!profile)
    throw profileError(
      "Ce profil ne peut pas être restauré.",
      "PROFILE_NOT_RESTORABLE",
      409,
    );
  profile.publicationStatus = "PUBLISHED";
  profile.hiddenAt = null;
  profile.hiddenBy = null;
  profile.lastAdminComment = comment;
  await profile.save();
  await log(profile, admin, "RESTORED", comment);
  return profile;
}

module.exports = {
  assertNoSolicitation,
  getMine,
  updateDraft,
  submit,
  startRevision,
  listPublic,
  publicDetail,
  listAdmin,
  adminDetail,
  approve,
  requestChanges,
  editorialCorrection,
  hide,
  restore,
};
