const env = require("../config/env");
const { resend } = require("./email.service");

async function upsertContact({
  email,
  firstName = null,
  lastName = null,
  subscribed,
  segmentId = null,
}) {
  if (!env.EMAIL_CONTACT_SYNC_ENABLED) {
    return { skipped: true, reason: "CONTACT_SYNC_DISABLED" };
  }

  const payload = {
    email,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    unsubscribed: !subscribed,
    segments: subscribed && segmentId ? [{ id: segmentId }] : undefined,
  };
  const created = await resend.contacts.create(payload);
  let contactId = created.data?.id || null;
  if (created.error) {
    const updated = await resend.contacts.update({
      email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      unsubscribed: payload.unsubscribed,
    });
    if (updated.error) {
      const error = new Error(updated.error.message || "La synchronisation du contact email a échoué.");
      error.statusCode = 502;
      throw error;
    }
    contactId = updated.data?.id || null;
  }

  if (segmentId) {
    const segment = subscribed
      ? await resend.contacts.segments.add({ email, segmentId })
      : await resend.contacts.segments.remove({ email, segmentId });
    if (segment.error && segment.error.statusCode !== 404) {
      const error = new Error(segment.error.message || "La synchronisation du segment email a échoué.");
      error.statusCode = 502;
      throw error;
    }
  }
  return { synced: true, contactId };
}

function syncQuizMarketingContact({ email, firstName, granted }) {
  return upsertContact({
    email,
    firstName,
    subscribed: granted,
    segmentId: env.RESEND_QUIZ_SEGMENT_ID,
  });
}

function syncNewsletterContact({ email, attributes = {}, subscribed }) {
  return upsertContact({
    email,
    firstName: attributes.PRENOM || attributes.firstName,
    lastName: attributes.NOM || attributes.lastName,
    subscribed,
    segmentId: env.RESEND_NEWSLETTER_SEGMENT_ID,
  });
}

module.exports = {
  upsertContact,
  syncQuizMarketingContact,
  syncNewsletterContact,
};
