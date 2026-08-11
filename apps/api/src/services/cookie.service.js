const env = require("../config/env");

const STANDARD_SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000;

function getBaseCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  };
}

function setAuthCookies(res, { accessToken, refreshToken, rememberMe }) {
  const baseOptions = getBaseCookieOptions();
  const sessionDuration = rememberMe
    ? REMEMBER_ME_DURATION
    : STANDARD_SESSION_DURATION;

  res.cookie("accessToken", accessToken, {
    ...baseOptions,
    path: "/",
    // Le JWT reste valable 15 minutes, mais son cookie doit survivre jusqu'au
    // renouvellement automatique. Sinon, une page rechargée après 15 minutes
    // fait apparaître la personne comme déconnectée alors que sa session est
    // encore valide pendant 7 ou 30 jours.
    maxAge: sessionDuration,
  });

  res.cookie("refreshToken", refreshToken, {
    ...baseOptions,
    path: "/api/auth",
    maxAge: sessionDuration,
  });
}

function clearAuthCookies(res) {
  const baseOptions = getBaseCookieOptions();

  res.clearCookie("accessToken", {
    ...baseOptions,
    path: "/",
  });

  res.clearCookie("refreshToken", {
    ...baseOptions,
    path: "/api/auth",
  });
}

module.exports = {
  STANDARD_SESSION_DURATION,
  REMEMBER_ME_DURATION,
  setAuthCookies,
  clearAuthCookies,
};
