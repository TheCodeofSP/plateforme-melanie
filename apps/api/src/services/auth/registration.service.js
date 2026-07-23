const mongoose = require("mongoose");
const User = require("../../models/User");
const ConsentRecord = require("../../models/ConsentRecord");
const AccountToken = require("../../models/AccountToken");
const ParentalAuthorization = require("../../models/ParentalAuthorization");
const env = require("../../config/env");
const DOCUMENT_VERSIONS = require("../../config/documentVersions");
const { calculateAge } = require("../../utils/age.utils");
const { hashPassword } = require("../password.service");
const { generateToken, hashToken } = require("../token.service");
const { sendTransactionalEmail } = require("../email.service");
const {
  createEmailVerificationTemplate,
  createParentalAuthorizationTemplate,
} = require("../../templates/auth");
const { createConflictError } = require("./authErrors");
const EMAIL_VERIFICATION_DURATION = 24 * 60 * 60 * 1000;
const PARENTAL_AUTHORIZATION_DURATION = 7 * 24 * 60 * 60 * 1000;

async function ensureEmailIsAvailable(email) {
  const existingUser = await User.exists({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw createConflictError(
      "Un compte existe déjà avec cette adresse email.",
    );
  }
}

async function ensurePseudonymIsAvailable(pseudonym) {
  const existingUser = await User.findOne({
    pseudonym,
  })
    .collation({
      locale: "fr",
      strength: 2,
    })
    .select("_id")
    .lean();

  if (existingUser) {
    throw createConflictError("Ce pseudonyme est déjà utilisé.");
  }
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
      acceptedAt: newsletterConsent ? acceptedAt : null,
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
    dateOfBirth,
    password,
    guardianEmail,
    hasAcceptedTerms,
    hasAcknowledgedPrivacyPolicy,
    newsletterConsent,
    commercialEmailConsent,
  } = data;

  await Promise.all([
    ensureEmailIsAvailable(email),
    ensurePseudonymIsAvailable(pseudonym),
  ]);

  const age = calculateAge(dateOfBirth);
  const isMinor = age < 18;

  const passwordHash = await hashPassword(password);

  const emailVerificationToken = generateToken();
  const emailVerificationTokenHash = hashToken(emailVerificationToken);

  const parentalAuthorizationToken = isMinor ? generateToken() : null;

  const parentalAuthorizationTokenHash = isMinor
    ? hashToken(parentalAuthorizationToken)
    : null;

  const now = new Date();

  const session = await mongoose.startSession();

  let user;

  try {
    await session.withTransaction(async () => {
      [user] = await User.create(
        [
          {
            email,
            firstName,
            lastName,
            pseudonym,
            dateOfBirth: new Date(`${dateOfBirth}T00:00:00.000Z`),
            passwordHash,
          },
        ],
        {
          session,
        },
      );

      const consentRecords = buildConsentRecords({
        userId: user._id,
        hasAcceptedTerms,
        hasAcknowledgedPrivacyPolicy,
        newsletterConsent,
        commercialEmailConsent,
        acceptedAt: now,
      });

      await ConsentRecord.insertMany(consentRecords, {
        session,
      });

      await AccountToken.create(
        [
          {
            user: user._id,
            type: "EMAIL_VERIFICATION",
            tokenHash: emailVerificationTokenHash,
            expiresAt: new Date(now.getTime() + EMAIL_VERIFICATION_DURATION),
          },
        ],
        {
          session,
        },
      );

      if (isMinor) {
        await ParentalAuthorization.create(
          [
            {
              user: user._id,
              guardianEmail,
              tokenHash: parentalAuthorizationTokenHash,
              documentVersion: DOCUMENT_VERSIONS.PARENTAL_AUTHORIZATION,
              sentAt: now,
              expiresAt: new Date(
                now.getTime() + PARENTAL_AUTHORIZATION_DURATION,
              ),
            },
          ],
          {
            session,
          },
        );
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      throw createConflictError(
        "L’adresse email ou le pseudonyme est déjà utilisé.",
      );
    }

    throw error;
  } finally {
    await session.endSession();
  }

  const emailVerificationTemplate = createEmailVerificationTemplate({
    firstName,
    token: emailVerificationToken,
  });

  const emailPromises = [
    sendTransactionalEmail({
      emailType: "ACCOUNT_ACTIVATION",
      recipientEmail: email,
      recipientName: firstName,
      ...emailVerificationTemplate,
    }),
  ];

  if (isMinor) {
    const parentalAuthorizationTemplate = createParentalAuthorizationTemplate({
      minorFirstName: firstName,
      token: parentalAuthorizationToken,
    });

    emailPromises.push(
      sendTransactionalEmail({
        emailType: "PARENTAL_AUTHORIZATION",
        recipientEmail: guardianEmail,
        recipientName: "Responsable légal",
        ...parentalAuthorizationTemplate,
      }),
    );
  }

  const emailResults = await Promise.allSettled(emailPromises);

  const emailsAccepted = emailResults.every(
    (result) => result.status === "fulfilled",
  );

  await require("../dashboard/crm.service").syncIdentity({
    user,
    source: "PLATFORM_REGISTRATION",
  });

  if (env.NODE_ENV === "development" && env.EMAIL_MODE === "capture") {
    console.log("\n🔗 Lien de validation email :");
    console.log(
      `${env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`,
    );

    if (isMinor) {
      console.log("\n🔗 Lien d’autorisation parentale :");
      console.log(
        `${env.CLIENT_URL}/parental-authorization?token=${parentalAuthorizationToken}`,
      );
    }
  }

  return {
    userId: user._id,
    requiresParentalAuthorization: isMinor,
    emailsAccepted,
  };
}

module.exports = {
  ensureEmailIsAvailable,
  ensurePseudonymIsAvailable,
  buildConsentRecords,
  registerUser,
};
