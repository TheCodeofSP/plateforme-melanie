const {
  assertNoSolicitation,
} = require("../services/professionalProfile.service");
const forbiddenHosts = [
  /calendly\./i,
  /paypal\./i,
  /stripe\./i,
  /wa\.me$/i,
  /messenger\.com$/i,
  /t\.me$/i,
  /linktr\.ee$/i,
];
function safePlaceError(message, code, statusCode = 400, details) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
}
function validateSafePlaceContent(...parts) {
  assertNoSolicitation({ shortPresentation: parts.filter(Boolean).join(" ") });
}
function validateLinks(links = []) {
  for (const link of links) {
    let url;
    try {
      url = new URL(link.url);
    } catch {
      throw safePlaceError(
        "Un lien externe est invalide.",
        "SAFE_PLACE_INVALID_LINK",
      );
    }
    if (
      !["http:", "https:"].includes(url.protocol) ||
      forbiddenHosts.some((pattern) => pattern.test(url.hostname)) ||
      /(?:affiliate|affiliation|referral|utm_affiliate)/i.test(url.search)
    )
      throw safePlaceError(
        "Ce type de lien n’est pas autorisé dans le Safe Place.",
        "SAFE_PLACE_LINK_FORBIDDEN",
      );
  }
}
function publicAuthor(user) {
  if (!user) return { name: "Ancienne membre", role: "FORMER_MEMBER" };
  if (user.role === "ADMIN")
    return { name: "Mélanie", role: "ADMIN", badge: "Administratrice" };
  return { name: user.pseudonym, role: "MEMBER" };
}
module.exports = {
  safePlaceError,
  validateSafePlaceContent,
  validateLinks,
  publicAuthor,
};
