const mongoose = require("mongoose");

const { ACCOUNT_TOKEN_TYPES, AUTH_DURATIONS } = require("../../config/auth.constants");
const env = require("../../config/env");
const AccountToken = require("../../models/AccountToken");
const User = require("../../models/User");
const { createEmailVerificationTemplate } = require("../../templates/auth");
const { sendTransactionalEmail } = require("../email.service");
const { generateToken, hashToken } = require("../token.service");
const { createBadRequestError } = require("./authErrors");

async function verifyEmail(token) {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const now = new Date();
      const tokenHash = hashToken(token);
      const accountToken = await AccountToken.findOneAndUpdate(
        {
          type: ACCOUNT_TOKEN_TYPES.EMAIL_VERIFICATION,
          tokenHash,
          usedAt: null,
          expiresAt: { $gt: now },
        },
        { $set: { usedAt: now } },
        { new: true, session },
      ).select("+tokenHash");

      if (!accountToken) {
        const knownToken = await AccountToken.findOne({
          type: ACCOUNT_TOKEN_TYPES.EMAIL_VERIFICATION,
          tokenHash,
        })
          .select("usedAt expiresAt")
          .session(session);

        if (knownToken?.usedAt) {
          throw createBadRequestError(
            "Ce lien de validation a déjà été utilisé. Ton adresse email est déjà confirmée.",
          );
        }
        if (knownToken && knownToken.expiresAt <= now) {
          throw createBadRequestError("Le lien de validation a expiré.");
        }
        throw createBadRequestError("Le lien de validation est invalide ou a expiré.");
      }

      const user = await User.findById(accountToken.user).session(session);
      if (!user) {
        throw createBadRequestError("Le compte associé à ce lien n’existe plus.");
      }

      user.emailVerifiedAt ||= now;
      user.accountStatus = "ACTIVE";
      await user.save({ session });
    });
  } finally {
    await session.endSession();
  }

  return { accountActivated: true, alreadyVerified: false };
}

async function resendEmailVerification(email) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || user.accountStatus !== "PENDING_ACTIVATION" || user.emailVerifiedAt) {
    return { emailAccepted: false };
  }

  const latestToken = await AccountToken.findOne({
    user: user._id,
    type: ACCOUNT_TOKEN_TYPES.EMAIL_VERIFICATION,
  }).sort({ createdAt: -1 });

  if (
    latestToken &&
    Date.now() - latestToken.createdAt.getTime() < AUTH_DURATIONS.RESEND_COOLDOWN_MS
  ) {
    return { emailAccepted: false };
  }

  const token = generateToken();
  const now = new Date();
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await AccountToken.updateMany(
        {
          user: user._id,
          type: ACCOUNT_TOKEN_TYPES.EMAIL_VERIFICATION,
          usedAt: null,
        },
        { $set: { usedAt: now } },
        { session },
      );
      await AccountToken.create(
        [
          {
            user: user._id,
            type: ACCOUNT_TOKEN_TYPES.EMAIL_VERIFICATION,
            tokenHash: hashToken(token),
            expiresAt: new Date(now.getTime() + AUTH_DURATIONS.EMAIL_VERIFICATION_MS),
          },
        ],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  try {
    await sendTransactionalEmail({
      emailType: "ACCOUNT_ACTIVATION",
      recipientEmail: user.email,
      recipientName: user.firstName,
      ...createEmailVerificationTemplate({ firstName: user.firstName, token }),
    });
    if (env.NODE_ENV === "development" && env.EMAIL_MODE === "capture") {
      console.log(
        `\n🔗 Nouveau lien de validation email :\n${env.CLIENT_URL}/verifier-email?token=${token}`,
      );
    }
    return { emailAccepted: true };
  } catch (error) {
    console.error("❌ Échec du renvoi de l’email de validation :", error.message);
    return { emailAccepted: false };
  }
}

module.exports = { verifyEmail, resendEmailVerification };
