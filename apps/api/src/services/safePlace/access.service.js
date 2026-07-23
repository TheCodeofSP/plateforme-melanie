const ConsentRecord = require("../../models/ConsentRecord");
const SafePlaceSuspension = require("../../models/SafePlaceSuspension");
const DOCUMENT_VERSIONS = require("../../config/documentVersions");
const charter = require("../../data/safePlaceCharter");
async function getAccess(user) {
  if (user.role === "ADMIN")
    return {
      allowed: true,
      reason: null,
      isAdmin: true,
      currentVersion: charter.version,
    };
  if (user.role !== "MEMBER")
    return {
      allowed: false,
      reason: "SAFE_PLACE_ROLE_FORBIDDEN",
      currentVersion: charter.version,
    };
  const suspension = await SafePlaceSuspension.findOne({
    user: user._id,
    status: "ACTIVE",
    $or: [{ endsAt: null }, { endsAt: { $gt: new Date() } }],
  }).lean();
  if (suspension)
    return {
      allowed: false,
      reason: "SAFE_PLACE_SUSPENDED",
      suspension: { startsAt: suspension.startsAt, endsAt: suspension.endsAt },
      currentVersion: charter.version,
    };
  const consent = await ConsentRecord.findOne({
    user: user._id,
    type: "SAFE_PLACE_CHARTER",
  })
    .sort({ createdAt: -1 })
    .lean();
  return {
    allowed: Boolean(consent?.granted && consent.version === charter.version),
    reason:
      consent?.granted && consent.version === charter.version
        ? null
        : "SAFE_PLACE_CHARTER_REQUIRED",
    acceptedVersion: consent?.granted ? consent.version : null,
    currentVersion: charter.version,
  };
}
async function accept(user) {
  if (user.role !== "MEMBER") {
    const e = new Error(
      "Seul un compte membre personnel peut accepter la charte.",
    );
    e.statusCode = 403;
    e.code = "SAFE_PLACE_ROLE_FORBIDDEN";
    throw e;
  }
  const latest = await ConsentRecord.findOne({
    user: user._id,
    type: "SAFE_PLACE_CHARTER",
  })
    .sort({ createdAt: -1 })
    .lean();
  if (
    latest?.granted &&
    latest.version === DOCUMENT_VERSIONS.SAFE_PLACE_CHARTER
  )
    return latest;
  return ConsentRecord.create({
    user: user._id,
    type: "SAFE_PLACE_CHARTER",
    version: DOCUMENT_VERSIONS.SAFE_PLACE_CHARTER,
    granted: true,
    acceptedAt: new Date(),
    withdrawnAt: null,
  });
}
async function withdraw(user) {
  if (user.role !== "MEMBER") {
    const e = new Error("Cette action est réservée aux membres.");
    e.statusCode = 403;
    e.code = "SAFE_PLACE_ROLE_FORBIDDEN";
    throw e;
  }
  return ConsentRecord.create({
    user: user._id,
    type: "SAFE_PLACE_CHARTER",
    version: DOCUMENT_VERSIONS.SAFE_PLACE_CHARTER,
    granted: false,
    acceptedAt: null,
    withdrawnAt: new Date(),
  });
}
module.exports = { charter, getAccess, accept, withdraw };
