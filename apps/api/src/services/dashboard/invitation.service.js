const crypto = require("crypto");
const CrmContact = require("../../models/CrmContact");
const CrmInvitation = require("../../models/CrmInvitation");
const User = require("../../models/User");
const env = require("../../config/env");
const { sendTransactionalEmail } = require("../email.service");
const template = require("../../templates/dashboard/invitation.template");
const { dashboardError, timeline, syncIdentity } = require("./crm.service");
const hash = (token) => crypto.createHash("sha256").update(token).digest("hex");
async function create(admin, contactId, sendEmail = true) {
  const contact = await CrmContact.findOne({ _id: contactId, deletedAt: null, mergedInto: null, anonymizedAt: null });
  if (!contact) throw dashboardError("Contact introuvable.", "CRM_CONTACT_NOT_FOUND", 404);
  if (contact.user) throw dashboardError("Ce contact possède déjà un compte.", "CRM_CONTACT_ALREADY_MEMBER", 409);
  await CrmInvitation.updateMany({ contact: contactId, status: { $in: ["CREATED", "SENT", "OPENED"] } }, { $set: { status: "CANCELLED", cancelledAt: new Date() } });
  const token = crypto.randomBytes(32).toString("hex");
  const invitation = await CrmInvitation.create({ contact: contactId, tokenHash: hash(token), expiresAt: new Date(Date.now() + 7 * 86400000), createdBy: admin._id });
  await timeline(contactId, "INVITATION_CREATED", "Invitation créée.", admin, { model: "CrmInvitation", id: invitation._id });
  if (sendEmail) await send(invitation._id, token);
  return { invitation, token, url: `${env.CLIENT_URL}/register?invitation=${token}` };
}
async function send(id, knownToken = null) {
  const invitation = await CrmInvitation.findById(id).select("+tokenHash").populate("contact");
  if (!invitation || !["CREATED", "SENT", "OPENED"].includes(invitation.status) || invitation.expiresAt <= new Date()) throw dashboardError("Invitation indisponible.", "CRM_INVITATION_NOT_AVAILABLE", 409);
  if (invitation.lastSentAt && Date.now() - invitation.lastSentAt.getTime() < 86400000) throw dashboardError("L’invitation a été envoyée récemment.", "CRM_INVITATION_SEND_COOLDOWN", 429);
  if (!knownToken) throw dashboardError("Renouvelle l’invitation pour obtenir un nouveau lien sécurisé.", "CRM_INVITATION_RENEW_REQUIRED", 409);
  const url = `${env.CLIENT_URL}/register?invitation=${knownToken}`;
  await sendTransactionalEmail({ emailType: "CRM_INVITATION", recipientEmail: invitation.contact.primaryEmail, recipientName: invitation.contact.firstName, ...template({ firstName: invitation.contact.firstName, url }) });
  invitation.status = "SENT"; invitation.sentAt ||= new Date(); invitation.lastSentAt = new Date(); invitation.sendCount += 1; await invitation.save();
  return invitation;
}
async function inspect(token) {
  const invitation = await CrmInvitation.findOne({ tokenHash: hash(token), status: { $in: ["CREATED", "SENT", "OPENED"] }, expiresAt: { $gt: new Date() } }).populate("contact", "firstName lastName primaryEmail");
  if (!invitation) throw dashboardError("Invitation invalide ou expirée.", "CRM_INVITATION_INVALID", 404);
  if (invitation.status !== "OPENED") { invitation.status = "OPENED"; invitation.openedAt = new Date(); await invitation.save(); }
  return { invitationId: invitation._id, expiresAt: invitation.expiresAt, prefill: { firstName: invitation.contact.firstName, lastName: invitation.contact.lastName, email: invitation.contact.primaryEmail } };
}
async function accept(token, user) {
  const invitation = await CrmInvitation.findOne({ tokenHash: hash(token), status: { $in: ["CREATED", "SENT", "OPENED"] }, expiresAt: { $gt: new Date() } }).populate("contact");
  if (!invitation) throw dashboardError("Invitation invalide ou expirée.", "CRM_INVITATION_INVALID", 404);
  const existing = await User.findById(user._id);
  const contact = invitation.contact;
  if (contact.primaryEmail !== existing.email) contact.emailAliases = [...new Set([...contact.emailAliases, contact.primaryEmail])];
  contact.primaryEmail = existing.email; contact.user = existing._id; contact.firstName = existing.firstName; contact.lastName = existing.lastName; contact.sources.push({ type: "PLATFORM_REGISTRATION" }); await contact.save();
  invitation.status = "ACCEPTED"; invitation.acceptedAt = new Date(); await invitation.save(); await timeline(contact._id, "INVITATION_ACCEPTED", "Invitation acceptée.", existing); await syncIdentity({ user: existing, source: "PLATFORM_REGISTRATION" }); return contact;
}
async function cancel(admin, id) { const invitation = await CrmInvitation.findOne({ _id: id, status: { $in: ["CREATED", "SENT", "OPENED"] } }); if (!invitation) throw dashboardError("Invitation non annulable.", "CRM_INVITATION_NOT_CANCELLABLE", 409); invitation.status = "CANCELLED"; invitation.cancelledAt = new Date(); await invitation.save(); await timeline(invitation.contact, "INVITATION_CANCELLED", "Invitation annulée.", admin); return invitation; }
async function expire() { const result = await CrmInvitation.updateMany({ status: { $in: ["CREATED", "SENT", "OPENED"] }, expiresAt: { $lte: new Date() } }, { $set: { status: "EXPIRED" } }); return { processed: result.modifiedCount, failed: 0 }; }
module.exports = { create, inspect, accept, cancel, expire };
