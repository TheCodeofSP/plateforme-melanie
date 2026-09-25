const mongoose = require("mongoose");
const User = require("../../models/User");
const ConsentRecord = require("../../models/ConsentRecord");
const AccountToken = require("../../models/AccountToken");
const env = require("../../config/env");
const DOCUMENT_VERSIONS = require("../../config/documentVersions");
const { generateToken, hashToken } = require("../token.service");
const { sendTransactionalEmail } = require("../email.service");
const { syncIdentity } = require("../dashboard/crm.service");
const { createEmailVerificationTemplate } = require("../../templates/auth");
const { createConflictError } = require("./authErrors");

const EMAIL_VERIFICATION_DURATION = 24 * 60 * 60 * 1000;

async function ensureEmailIsAvailable(email) {
  if (await User.exists({ email: email.toLowerCase() }))
    throw createConflictError("Un compte existe déjà avec cette adresse email.");
}

async function ensurePseudonymIsAvailable(pseudonym) {
  const existingUser = await User.findOne({ pseudonym })
    .collation({ locale: "fr", strength: 2 })
    .select("_id")
    .lean();
  if (existingUser) throw createConflictError("Ce pseudonyme est déjà utilisé.");
}

function buildConsentRecords({
  userId,
  hasAcceptedTerms,
  hasAcknowledgedPrivacyPolicy,
  newsletterConsent,
  commercialEmailConsent,
  acceptedAt,
}) {
  return [
    {
      user: userId,
      type: "TERMS",
      version: DOCUMENT_VERSIONS.TERMS,
      granted: hasAcceptedTerms,
      acceptedAt,
    },
    {
      user: userId,
      type: "PRIVACY_POLICY",
      version: DOCUMENT_VERSIONS.PRIVACY_POLICY,
      granted: hasAcknowledgedPrivacyPolicy,
      acceptedAt,
    },
    {
      user: userId,
      type: "NEWSLETTER",
      version: DOCUMENT_VERSIONS.NEWSLETTER,
      granted: newsletterConsent,
      acceptedAt,
    },
    {
      user: userId,
      type: "COMMERCIAL_EMAIL",
      version: DOCUMENT_VERSIONS.COMMERCIAL_EMAIL,
      granted: commercialEmailConsent,
      acceptedAt: commercialEmailConsent ? acceptedAt : null,
    },
  ];
}

async function registerUser(data) {
  const {
    email,
    firstName,
    lastName,
    pseudonym,
    hasAcceptedTerms,
    hasAcknowledgedPrivacyPolicy,
    newsletterConsent,
    commercialEmailConsent,
  } = data;
  await Promise.all([ensureEmailIsAvailable(email), ensurePseudonymIsAvailable(pseudonym)]);

  const token = generateToken();
  const now = new Date();
  const session = await mongoose.startSession();
  let user;

  try {
    await session.withTransaction(async () => {
      [user] = await User.create([{ email, firstName, lastName, pseudonym }], {
        session,
      });
      await ConsentRecord.insertMany(
        buildConsentRecords({
          userId: user._id,
          hasAcceptedTerms,
          hasAcknowledgedPrivacyPolicy,
          newsletterConsent,
          commercialEmailConsent,
          acceptedAt: now,
        }),
        { session },
      );
      await AccountToken.create(
        [
          {
            user: user._id,
            type: "EMAIL_VERIFICATION",
            tokenHash: hashToken(token),
            expiresAt: new Date(now.getTime() + EMAIL_VERIFICATION_DURATION),
          },
        ],
        { session },
      );
    });
  } catch (error) {
    if (error.code === 11000)
      throw createConflictError("L’adresse email ou le pseudonyme est déjà utilisé.");
    throw error;
  } finally {
    await session.endSession();
  }

  const template = createEmailVerificationTemplate({ firstName, token });
  const emailResult = await sendTransactionalEmail({
    emailType: "ACCOUNT_ACTIVATION",
    recipientEmail: email,
    recipientName: firstName,
    ...template,
  })
    .then(() => true)
    .catch(() => false);
  await syncIdentity({ user, source: "PLATFORM_REGISTRATION" });

  if (env.NODE_ENV === "development" && env.EMAIL_MODE === "capture")
    console.log(`\n🔗 Lien de validation email :\n${env.CLIENT_URL}/verifier-email?token=${token}`);

  return { userId: user._id, emailsAccepted: emailResult };
}

module.exports = {
  ensureEmailIsAvailable,
  ensurePseudonymIsAvailable,
  buildConsentRecords,
  registerUser,
};
