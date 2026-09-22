const User = require("../models/User");
const Session = require("../models/Session");
const { verifyAccessToken } = require("../services/token.service");

async function optionalAuthenticate(req, res, next) {
  try {
    const token = req.cookies.accessToken;
    if (!token) return next();
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      return next();
    }
    const [session, user] = await Promise.all([
      Session.findOne({
        _id: payload.sessionId,
        user: payload.sub,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      }),
      User.findById(payload.sub),
    ]);
    if (session && user?.accountStatus === "ACTIVE")
      req.auth = { user, session };
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = optionalAuthenticate;
