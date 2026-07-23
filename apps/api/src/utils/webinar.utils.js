function webinarError(message, code, statusCode = 400) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}
function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 100);
}
function confirmationDelayMs(startsAt, now = new Date()) {
  const hours = (new Date(startsAt) - now) / 3600000;
  if (hours <= 1) return 0;
  if (hours < 12) return 3600000;
  if (hours <= 24) return 4 * 3600000;
  return 12 * 3600000;
}
function registrationOpen(session, now = new Date()) {
  return (
    ["SCHEDULED", "POSTPONED"].includes(session.status) &&
    !session.registrationsManuallyClosed &&
    new Date(session.startsAt) - now > 3600000
  );
}
module.exports = {
  webinarError,
  slugify,
  confirmationDelayMs,
  registrationOpen,
};
