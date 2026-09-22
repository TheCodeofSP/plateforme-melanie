const mongoose = require("mongoose");

const { ACCOUNT_TOKEN_TYPES, AUTH_DURATIONS } = require("../../config/auth.constants");
const env = require("../../config/env");
const AccountToken = require("../../models/AccountToken");
const Session = require("../../models/Session");
const User = require("../../models/User");
const createMagicLoginTemplate = require("../../templates/auth/magicLogin.template");
const { STANDARD_SESSION_DURATION } = require("../cookie.service");
const { sendTransactionalEmail } = require("../email.service");
const { generateAccessToken, generateToken, hashToken } = require("../token.service");
const { createAuthenticationError } = require("./authErrors");

function publicUser(user) {
  return {
    id: user._id,
    pseudonym: user.pseudonym,
    role: user.role,
    currentSpmProfile: user.currentSpmProfile,
    quizCompleted: user.quizCompleted,
  };
}

async function requestLoginLink(email) {
  const user = await User.findOne({
    email: email.toLowerCase(),
    accountStatus: { $ne: "ANONYMIZED" },
  });
  if (!user || user.accountStatus !== "ACTIVE" || !user.emailVerifiedAt) return;

  const token = generateToken();
  const now = new Date();
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await AccountToken.updateMany(
        { user: user._id, type: ACCOUNT_TOKEN_TYPES.LOGIN_LINK, usedAt: null },
        { $set: { usedAt: now } },
        { session },
      );
      await AccountToken.create(
        [
          {
            user: user._id,
            type: ACCOUNT_TOKEN_TYPES.LOGIN_LINK,
            tokenHash: hashToken(token),
            expiresAt: new Date(now.getTime() + AUTH_DURATIONS.LOGIN_LINK_MS),
          },
        ],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  await sendTransactionalEmail({
    emailType: "LOGIN_LINK",
    recipientEmail: user.email,
    recipientName: user.firstName,
    ...createMagicLoginTemplate({ firstName: user.firstName, token }),
  });
  if (env.NODE_ENV === "development" && env.EMAIL_MODE === "capture") {
    console.log(`\n🔗 Lien de connexion :\n${env.CLIENT_URL}/connexion/lien?token=${token}`);
  }
}

async function consumeLoginLink({ token, userAgent }) {
  const now = new Date();
  const databaseSession = await mongoose.startSession();
  let result;

  try {
    await databaseSession.withTransaction(async () => {
      const tokenRecord = await AccountToken.findOneAndUpdate(
        {
          type: ACCOUNT_TOKEN_TYPES.LOGIN_LINK,
          tokenHash: hashToken(token),
          usedAt: null,
          expiresAt: { $gt: now },
        },
        { $set: { usedAt: now } },
        { new: true, session: databaseSession },
      ).select("+tokenHash");

      if (!tokenRecord) {
        throw createAuthenticationError({
          message: "Ce lien de connexion est invalide, expiré ou a déjà été utilisé.",
          code: "INVALID_LOGIN_LINK",
          statusCode: 400,
        });
      }

      const user = await User.findById(tokenRecord.user).session(databaseSession);
      if (!user || user.accountStatus !== "ACTIVE") {
        throw createAuthenticationError({
          message: "Ce compte n’est pas accessible.",
          code: "ACCOUNT_UNAVAILABLE",
          statusCode: 403,
        });
      }

      await Session.updateMany(
        { user: user._id, revokedAt: null },
        { $set: { revokedAt: now } },
        { session: databaseSession },
      );
      const refreshToken = generateToken();
      const [newSession] = await Session.create(
        [
          {
            user: user._id,
            refreshTokenHash: hashToken(refreshToken),
            userAgent: userAgent?.slice(0, 500) || "Appareil inconnu",
            rememberMe: false,
            lastUsedAt: now,
            expiresAt: new Date(now.getTime() + STANDARD_SESSION_DURATION),
          },
        ],
        { session: databaseSession },
      );

      user.lastLoginAt = now;
      await user.save({ session: databaseSession });
      result = {
        accessToken: generateAccessToken({
          userId: user._id,
          sessionId: newSession._id,
        }),
        refreshToken,
        rememberMe: false,
        user: publicUser(user),
      };
    });
  } finally {
    await databaseSession.endSession();
  }

  return result;
}

module.exports = { requestLoginLink, consumeLoginLink };
