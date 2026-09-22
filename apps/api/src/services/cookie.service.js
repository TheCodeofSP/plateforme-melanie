const env = require("../config/env");

const STANDARD_SESSION_DURATION = 24 * 60 * 60 * 1000;
const REMEMBER_ME_DURATION = STANDARD_SESSION_DURATION;

function getBaseCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  };
}

function setAuthCookies(res, { accessToken, refreshToken }) {
  const baseOptions = getBaseCookieOptions();

  res.cookie("accessToken", accessToken, {
    ...baseOptions,
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    ...baseOptions,
    path: "/api/auth",
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
