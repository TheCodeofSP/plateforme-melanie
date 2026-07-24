const User = require("../../models/User");
const Session = require("../../models/Session");
const ParentalAuthorization = require("../../models/ParentalAuthorization");
const { calculateAge } = require("../../utils/age.utils");
const { verifyPassword } = require("../password.service");
const { generateToken, hashToken, generateAccessToken } = require("../token.service");
const { STANDARD_SESSION_DURATION, REMEMBER_ME_DURATION } = require("../cookie.service");
const { createAuthenticationError } = require("./authErrors");

async function loginUser({ email, password, rememberMe, userAgent }) {
  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+passwordHash");

  if (!user || user.accountStatus === "ANONYMIZED") {
    throw createAuthenticationError({
      message: "Email ou mot de passe incorrect.",
      code: "INVALID_CREDENTIALS",
      statusCode: 401,
    });
  }

  const passwordIsValid = await verifyPassword(password, user.passwordHash);

  if (!passwordIsValid) {
    throw createAuthenticationError({
      message: "Email ou mot de passe incorrect.",
      code: "INVALID_CREDENTIALS",
      statusCode: 401,
    });
  }

  if (user.accountStatus === "SUSPENDED") {
    throw createAuthenticationError({
      message:
        "Ce compte est actuellement suspendu. Contacte Mélanie pour obtenir davantage d’informations.",
      code: "ACCOUNT_SUSPENDED",
      statusCode: 403,
    });
  }

  if (user.accountStatus === "PENDING_ACTIVATION") {
    const pendingValidations = [];

    if (!user.emailVerifiedAt) {
      pendingValidations.push("EMAIL_VERIFICATION");
    }

    const age = calculateAge(user.dateOfBirth);

    if (age < 18) {
      const parentalAuthorization = await ParentalAuthorization.findOne({
        user: user._id,
        status: "APPROVED",
      });

      if (!parentalAuthorization) {
        pendingValidations.push("PARENTAL_AUTHORIZATION");
      }
    }

    throw createAuthenticationError({
      message: "Ton compte doit encore être activé.",
      code: "ACCOUNT_PENDING_ACTIVATION",
      statusCode: 403,
      details: {
        pendingValidations,
      },
    });
  }

  const refreshToken = generateToken();
  const refreshTokenHash = hashToken(refreshToken);

  const sessionDuration = rememberMe
    ? REMEMBER_ME_DURATION
    : STANDARD_SESSION_DURATION;

  const session = await Session.create({
    user: user._id,
    refreshTokenHash,
    userAgent: userAgent?.slice(0, 500) || "Appareil inconnu",
    rememberMe,
    lastUsedAt: new Date(),
    expiresAt: new Date(Date.now() + sessionDuration),
  });

  const accessToken = generateAccessToken({
    userId: user._id,
    sessionId: session._id,
  });

  user.lastLoginAt = new Date();

  await user.save();

  return {
    accessToken,
    refreshToken,
    rememberMe,
    user: {
      id: user._id,
      pseudonym: user.pseudonym,
      role: user.role,
      currentSpmProfile: user.currentSpmProfile,
      quizCompleted: user.quizCompleted,
    },
  };
}

async function refreshUserSession(refreshToken) {
  if (!refreshToken) {
    throw createAuthenticationError({
      message: "Session invalide ou expirée.",
      code: "INVALID_SESSION",
      statusCode: 401,
    });
  }

  const refreshTokenHash = hashToken(refreshToken);

  const session = await Session.findOne({
    refreshTokenHash,
    revokedAt: null,
  }).select("+refreshTokenHash");

  if (!session || session.expiresAt <= new Date()) {
    throw createAuthenticationError({
      message: "Session invalide ou expirée.",
      code: "INVALID_SESSION",
      statusCode: 401,
    });
  }

  const user = await User.findById(session.user);

  if (!user || user.accountStatus !== "ACTIVE") {
    session.revokedAt = new Date();

    await session.save();

    throw createAuthenticationError({
      message: "Session invalide ou expirée.",
      code: "INVALID_SESSION",
      statusCode: 401,
    });
  }

  const newRefreshToken = generateToken();
  const newRefreshTokenHash = hashToken(newRefreshToken);

  const sessionDuration = session.rememberMe
    ? REMEMBER_ME_DURATION
    : STANDARD_SESSION_DURATION;

  session.refreshTokenHash = newRefreshTokenHash;
  session.lastUsedAt = new Date();
  session.expiresAt = new Date(Date.now() + sessionDuration);

  await session.save();

  const accessToken = generateAccessToken({
    userId: user._id,
    sessionId: session._id,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    rememberMe: session.rememberMe,
    user: {
      id: user._id,
      pseudonym: user.pseudonym,
      role: user.role,
      currentSpmProfile: user.currentSpmProfile,
      quizCompleted: user.quizCompleted,
    },
  };
}

async function logoutUser(refreshToken) {
  if (!refreshToken) {
    return;
  }

  const refreshTokenHash = hashToken(refreshToken);

  const session = await Session.findOne({
    refreshTokenHash,
    revokedAt: null,
  }).select("+refreshTokenHash");

  if (!session) {
    return;
  }

  session.revokedAt = new Date();

  await session.save();
}

async function logoutAllUserSessions(userId) {
  await Session.updateMany(
    {
      user: userId,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );
}

module.exports = {
  loginUser,
  refreshUserSession,
  logoutUser,
  logoutAllUserSessions,
};
