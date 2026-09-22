const User = require("../../models/User");
const Session = require("../../models/Session");
const {
  generateToken,
  hashToken,
  generateAccessToken,
} = require("../token.service");
const {
  STANDARD_SESSION_DURATION,
  REMEMBER_ME_DURATION,
} = require("../cookie.service");
const { createAuthenticationError } = require("./authErrors");

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
  refreshUserSession,
  logoutUser,
  logoutAllUserSessions,
};
