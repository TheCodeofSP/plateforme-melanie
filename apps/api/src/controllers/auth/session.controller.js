const {
  loginUser,
  refreshUserSession,
  logoutUser,
  logoutAllUserSessions,
  getUserSessions,
  revokeUserSession,
} = require("../../services/auth");
const { setAuthCookies, clearAuthCookies } = require("../../services/cookie.service");

async function login(req, res, next) {
  try {
    const result = await loginUser({
      ...req.body,
      userAgent: req.get("user-agent"),
    });

    setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      rememberMe: result.rememberMe,
    });

    res.status(200).json({
      success: true,
      message: "Connexion réussie.",
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
}

async function refreshSession(req, res, next) {
  try {
    const result = await refreshUserSession(req.cookies.refreshToken);

    setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      rememberMe: result.rememberMe,
    });

    res.status(200).json({
      success: true,
      message: "Session renouvelée.",
      user: result.user,
    });
  } catch (error) {
    clearAuthCookies(res);
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    await logoutUser(req.cookies.refreshToken);

    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: "Déconnexion réussie.",
    });
  } catch (error) {
    clearAuthCookies(res);
    next(error);
  }
}

async function getCurrentUser(req, res) {
  const user = req.auth.user;

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      pseudonym: user.pseudonym,
      dateOfBirth: user.dateOfBirth,
      role: user.role,
      accountStatus: user.accountStatus,
      emailVerifiedAt: user.emailVerifiedAt,
      currentSpmProfile: user.currentSpmProfile,
      quizCompleted: user.quizCompleted,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    },
  });
}

async function logoutAll(req, res, next) {
  try {
    await logoutAllUserSessions(req.auth.user._id);

    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: "Toutes les sessions ont été déconnectées.",
    });
  } catch (error) {
    clearAuthCookies(res);
    next(error);
  }
}

async function getCurrentUserSessions(req, res, next) {
  try {
    const sessions = await getUserSessions({
      userId: req.auth.user._id,
      currentSessionId: req.auth.session._id,
    });

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    next(error);
  }
}

async function revokeCurrentUserSession(req, res, next) {
  try {
    const result = await revokeUserSession({
      userId: req.auth.user._id,
      sessionId: req.params.sessionId,
      currentSessionId: req.auth.session._id,
    });

    if (result.wasCurrent) {
      clearAuthCookies(res);
    }

    res.status(200).json({
      success: true,
      message: result.wasCurrent
        ? "La session actuelle a été déconnectée."
        : "L’appareil a été déconnecté.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  refreshSession,
  logout,
  getCurrentUser,
  logoutAll,
  getCurrentUserSessions,
  revokeCurrentUserSession,
};
