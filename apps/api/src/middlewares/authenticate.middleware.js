const User = require("../models/User");
const Session = require("../models/Session");

const { verifyAccessToken } = require("../services/token.service");

function createAuthError(message, code, statusCode = 401) {
  const error = new Error(message);

  error.code = code;
  error.statusCode = statusCode;

  return error;
}

async function authenticate(req, res, next) {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw createAuthError(
        "Authentification requise.",
        "AUTHENTICATION_REQUIRED",
      );
    }

    let payload;

    try {
      payload = verifyAccessToken(accessToken);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw createAuthError(
          "Le jeton d’accès a expiré.",
          "ACCESS_TOKEN_EXPIRED",
        );
      }

      throw createAuthError(
        "Le jeton d’accès est invalide.",
        "INVALID_ACCESS_TOKEN",
      );
    }

    const session = await Session.findOne({
      _id: payload.sessionId,
      user: payload.sub,
      revokedAt: null,
      expiresAt: {
        $gt: new Date(),
      },
    });

    if (!session) {
      throw createAuthError(
        "La session est invalide ou expirée.",
        "INVALID_SESSION",
      );
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      throw createAuthError(
        "La session est invalide ou expirée.",
        "INVALID_SESSION",
      );
    }

    if (user.accountStatus === "SUSPENDED") {
      throw createAuthError(
        "Ce compte est actuellement suspendu.",
        "ACCOUNT_SUSPENDED",
        403,
      );
    }

    if (user.accountStatus !== "ACTIVE") {
      throw createAuthError(
        "La session est invalide ou expirée.",
        "INVALID_SESSION",
      );
    }

    req.auth = {
      user,
      session,
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authenticate;
