const env = require("../config/env");

const ACCESS_TOKEN_DURATION = 15 * 60 * 1000;
const STANDARD_SESSION_DURATION =
  7 * 24 * 60 * 60 * 1000;
const REMEMBER_ME_DURATION =
  30 * 24 * 60 * 60 * 1000;

function getBaseCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite:
      env.NODE_ENV === "production"
        ? "none"
        : "lax",
  };
}

function setAuthCookies(
  res,
  {
    accessToken,
    refreshToken,
    rememberMe,
  },
) {
  const baseOptions = getBaseCookieOptions();

  res.cookie("accessToken", accessToken, {
    ...baseOptions,
    path: "/",
    maxAge: ACCESS_TOKEN_DURATION,
  });

  res.cookie("refreshToken", refreshToken, {
    ...baseOptions,
    path: "/api/auth",
    maxAge: rememberMe
      ? REMEMBER_ME_DURATION
      : STANDARD_SESSION_DURATION,
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
  ACCESS_TOKEN_DURATION,
  STANDARD_SESSION_DURATION,
  REMEMBER_ME_DURATION,
  setAuthCookies,
  clearAuthCookies,
};