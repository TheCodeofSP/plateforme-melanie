const ConsentRecord = require("../models/ConsentRecord");
const SafePlaceSuspension = require("../models/SafePlaceSuspension");
const DOCUMENT_VERSIONS = require("../config/documentVersions");

function accessError(message, code) {
  const error = new Error(message);
  error.statusCode = 403;
  error.code = code;
  return error;
}

async function safePlaceAccess(req, res, next) {
  try {
    const user = req.auth?.user;
    if (!user)
      throw accessError("Authentification requise.", "AUTHENTICATION_REQUIRED");
    if (user.role === "ADMIN") {
      req.safePlace = { isAdmin: true };
      return next();
    }
    if (user.role !== "MEMBER")
      throw accessError(
        "Le Safe Place est réservé aux comptes membres personnels.",
        "SAFE_PLACE_ROLE_FORBIDDEN",
      );
    const suspension = await SafePlaceSuspension.findOne({
      user: user._id,
      status: "ACTIVE",
    });
    if (suspension) {
      if (suspension.endsAt && suspension.endsAt <= new Date()) {
        suspension.status = "EXPIRED";
        await suspension.save();
      } else
        throw accessError(
          "Ton accès au Safe Place est suspendu.",
          "SAFE_PLACE_SUSPENDED",
        );
    }
    const consent = await ConsentRecord.findOne({
      user: user._id,
      type: "SAFE_PLACE_CHARTER",
    })
      .sort({ createdAt: -1 })
      .lean();
    if (
      !consent?.granted ||
      consent.version !== DOCUMENT_VERSIONS.SAFE_PLACE_CHARTER
    )
      throw accessError(
        "Tu dois accepter la version actuelle de la charte.",
        "SAFE_PLACE_CHARTER_REQUIRED",
      );
    req.safePlace = { isAdmin: false, charterVersion: consent.version };
    return next();
  } catch (error) {
    return next(error);
  }
}
module.exports = safePlaceAccess;
