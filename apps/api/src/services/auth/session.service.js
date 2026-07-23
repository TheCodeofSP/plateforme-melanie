const Session = require("../../models/Session");

async function getUserSessions({ userId, currentSessionId }) {
  const sessions = await Session.find({
    user: userId,
    revokedAt: null,
    expiresAt: {
      $gt: new Date(),
    },
  })
    .sort({
      lastUsedAt: -1,
    })
    .lean();

  return sessions.map((session) => ({
    id: session._id,
    userAgent: session.userAgent,
    rememberMe: session.rememberMe,
    lastUsedAt: session.lastUsedAt,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    isCurrent: session._id.toString() === currentSessionId.toString(),
  }));
}

async function revokeUserSession({ userId, sessionId, currentSessionId }) {
  const session = await Session.findOne({
    _id: sessionId,
    user: userId,
    revokedAt: null,
  });

  if (!session) {
    const error = new Error("Cette session n’existe pas ou a déjà été fermée.");

    error.code = "SESSION_NOT_FOUND";
    error.statusCode = 404;

    throw error;
  }

  session.revokedAt = new Date();

  await session.save();

  return {
    wasCurrent: session._id.toString() === currentSessionId.toString(),
  };
}

module.exports = {
  getUserSessions,
  revokeUserSession,
};
