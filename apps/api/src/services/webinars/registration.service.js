const Webinar = require("../../models/Webinar");
const WebinarSession = require("../../models/WebinarSession");
const WebinarRegistration = require("../../models/WebinarRegistration");
const User = require("../../models/User");
const { createNotification } = require("../notification.service");
const email = require("./webinarEmail.service");
const { webinarError, registrationOpen, confirmationDelayMs } = require("../../utils/webinar.utils");

async function context(sessionId) {
  const session = await WebinarSession.findById(sessionId).select("+meetUrl");
  if (!session) throw webinarError("Session introuvable.", "WEBINAR_SESSION_NOT_FOUND", 404);
  const webinar = await Webinar.findOne({ _id: session.webinar, status: "PUBLISHED" });
  if (!webinar) throw webinarError("Webinaire indisponible.", "WEBINAR_NOT_AVAILABLE", 404);
  return { webinar, session };
}

function activeFor(userId, webinarId) {
  return WebinarRegistration.findOne({ user: userId, webinar: webinarId, status: { $in: ["REGISTERED", "WAITLISTED", "PRESENT", "ABSENT"] } });
}

function notify(user, type, title, message, webinarId, key = null, mandatory = false) {
  return createNotification({ recipient: user._id, type, title, message, targetType: "WEBINAR", targetId: webinarId, actionPath: `/webinars/${webinarId}`, deduplicationKey: key, mandatory, emailHandledExternally: true });
}

async function register(user, sessionId, adminOptions = null) {
  const { webinar, session } = await context(sessionId);
  if (!adminOptions && !registrationOpen(session)) throw webinarError("Les inscriptions sont fermées.", "WEBINAR_REGISTRATION_CLOSED", 409);
  if (await activeFor(user._id, webinar._id)) throw webinarError("Tu es déjà inscrite à une session de ce webinaire.", "WEBINAR_ALREADY_REGISTERED", 409);
  const pendingOffers = await WebinarRegistration.countDocuments({ session: session._id, status: "WAITLISTED", confirmationExpiresAt: { $gt: new Date() } });
  const full = session.counters.registered + pendingOffers >= session.capacity && !adminOptions?.capacityOverride;
  const status = full ? "WAITLISTED" : "REGISTERED";
  const position = full ? (await WebinarRegistration.countDocuments({ session: session._id, status: "WAITLISTED" })) + 1 : null;
  let registration;
  try {
    registration = await WebinarRegistration.create({ webinar: webinar._id, session: session._id, user: user._id, activeKey: `${webinar._id}:${user._id}`, status, waitlistPosition: position, confirmedAt: status === "REGISTERED" ? new Date() : null, registeredByAdmin: Boolean(adminOptions), capacityOverride: Boolean(adminOptions?.capacityOverride) });
  } catch (error) {
    if (error.code === 11000) throw webinarError("Tu es déjà inscrite à ce webinaire.", "WEBINAR_ALREADY_REGISTERED", 409);
    throw error;
  }
  await WebinarSession.updateOne({ _id: session._id }, { $inc: { [`counters.${status === "REGISTERED" ? "registered" : "waitlisted"}`]: 1 } });
  const notification = await notify(user, status === "REGISTERED" ? "WEBINAR_REGISTRATION" : "WEBINAR_WAITLIST", status === "REGISTERED" ? "Inscription confirmée" : "Liste d’attente", webinar.title, webinar._id, `webinar-registration:${registration._id}:${status}`);
  await email.send(status === "REGISTERED" ? "registration" : "waitlist", user, { title: webinar.title, position }, { notification: notification?._id, idempotencyKey: `webinar-registration:${registration._id}:${status}` });
  return registration;
}

async function promote(sessionId) {
  const session = await WebinarSession.findById(sessionId);
  if (!session || !registrationOpen(session)) return null;
  const offers = await WebinarRegistration.countDocuments({ session: sessionId, status: "WAITLISTED", confirmationExpiresAt: { $gt: new Date() } });
  if (session.counters.registered + offers >= session.capacity) return null;
  const waiting = await WebinarRegistration.findOne({ session: sessionId, status: "WAITLISTED", confirmationExpiresAt: null }).sort({ waitlistPosition: 1, createdAt: 1 }).populate("user");
  if (!waiting?.user) return null;
  const delay = confirmationDelayMs(session.startsAt);
  if (!delay) return null;
  waiting.promotedAt = new Date();
  waiting.confirmationExpiresAt = new Date(Date.now() + delay);
  await waiting.save();
  const webinar = await Webinar.findById(waiting.webinar);
  const notification = await notify(waiting.user, "WEBINAR_SEAT_OFFER", "Une place est disponible", webinar.title, webinar._id, `webinar-seat-offer:${waiting._id}:${waiting.promotedAt.getTime()}`);
  await email.send("seatOffer", waiting.user, { title: webinar.title, url: `${process.env.CLIENT_URL}/webinars/registrations/${waiting._id}/confirm` }, { notification: notification?._id, idempotencyKey: `webinar-seat-offer:${waiting._id}:${waiting.promotedAt.getTime()}` });
  return waiting;
}

async function confirm(user, id) {
  const registration = await WebinarRegistration.findOne({ _id: id, user: user._id, status: "WAITLISTED", confirmationExpiresAt: { $gt: new Date() } });
  if (!registration) throw webinarError("Cette proposition n’est plus valable.", "WEBINAR_SEAT_OFFER_EXPIRED", 409);
  const session = await WebinarSession.findById(registration.session);
  if (!session || session.counters.registered >= session.capacity) throw webinarError("La place n’est plus disponible.", "WEBINAR_SESSION_FULL", 409);
  registration.status = "REGISTERED";
  registration.confirmedAt = new Date();
  registration.waitlistPosition = null;
  registration.confirmationExpiresAt = null;
  await registration.save();
  await WebinarSession.updateOne({ _id: session._id }, { $inc: { "counters.registered": 1, "counters.waitlisted": -1 } });
  const webinar = await Webinar.findById(registration.webinar);
  const notification = await notify(user, "WEBINAR_REGISTRATION", "Inscription confirmée", webinar.title, webinar._id, `webinar-registration-confirmed:${registration._id}`);
  await email.send("registration", user, { title: webinar.title }, { notification: notification?._id, idempotencyKey: `webinar-registration-confirmed:${registration._id}` });
  return registration;
}

async function cancel(user, id, admin = false) {
  const registration = await WebinarRegistration.findOne({ _id: id, ...(admin ? {} : { user: user._id }), status: { $in: ["REGISTERED", "WAITLISTED"] } });
  if (!registration) throw webinarError("Inscription introuvable.", "WEBINAR_REGISTRATION_NOT_FOUND", 404);
  const session = await WebinarSession.findById(registration.session);
  if (!admin && new Date(session.startsAt) - new Date() <= 3600000) throw webinarError("L’annulation est fermée une heure avant.", "WEBINAR_CANCELLATION_CLOSED", 409);
  const previous = registration.status;
  registration.status = "CANCELLED";
  registration.activeKey = undefined;
  registration.cancelledAt = new Date();
  registration.confirmationExpiresAt = null;
  await registration.save();
  await WebinarSession.updateOne({ _id: session._id }, { $inc: { [`counters.${previous === "REGISTERED" ? "registered" : "waitlisted"}`]: -1 } });
  const webinar = await Webinar.findById(registration.webinar);
  const recipient = admin ? await User.findById(registration.user) : user;
  if (recipient) await notify(recipient, "WEBINAR_UNREGISTERED", "Inscription annulée", webinar?.title || "Webinaire", registration.webinar, `webinar-unregistered:${registration._id}:${registration.cancelledAt.getTime()}`);
  if (previous === "REGISTERED") await promote(session._id);
  return registration;
}

async function changeSession(user, id, newSessionId) {
  const registration = await WebinarRegistration.findOne({ _id: id, user: user._id, status: { $in: ["REGISTERED", "WAITLISTED"] } });
  if (!registration) throw webinarError("Inscription introuvable.", "WEBINAR_REGISTRATION_NOT_FOUND", 404);
  const target = await WebinarSession.findOne({ _id: newSessionId, webinar: registration.webinar });
  if (!target || !registrationOpen(target)) throw webinarError("Nouvelle session indisponible.", "WEBINAR_SESSION_NOT_AVAILABLE", 409);
  await cancel(user, id);
  return register(user, newSessionId);
}

async function mine(user) {
  const registrations = await WebinarRegistration.find({ user: user._id }).populate("webinar", "title shortDescription image status replay recommendedProfiles").populate({ path: "session", select: "+meetUrl" }).sort({ createdAt: -1 }).lean();
  const now = new Date();
  return registrations.map((registration) => ({ ...registration, session: registration.session ? { ...registration.session, meetUrl: registration.status === "REGISTERED" && new Date(registration.session.startsAt) - now <= 3600000 ? registration.session.meetUrl : undefined } : null }));
}

async function adminRegister(sessionId, data) {
  const user = await User.findOne({ _id: data.userId, role: { $in: ["MEMBER", "INTERVENANT", "ADMIN"] }, accountStatus: "ACTIVE" });
  if (!user) throw webinarError("Participante introuvable.", "WEBINAR_PARTICIPANT_NOT_FOUND", 404);
  return register(user, sessionId, data);
}

module.exports = { register, confirm, cancel, changeSession, mine, promote, adminRegister };
