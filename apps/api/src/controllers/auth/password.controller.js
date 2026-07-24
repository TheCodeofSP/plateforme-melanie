const {
  requestPasswordReset,
  resetPassword,
  changeUserPassword,
} = require("../../services/auth");
const { setAuthCookies, clearAuthCookies } = require("../../services/cookie.service");

async function forgotPassword(req, res, next) {
  try {
    await requestPasswordReset(req.body.email);

    res.status(200).json({
      success: true,
      message:
        "Si un compte correspond à cette adresse, un lien de réinitialisation a été envoyé.",
    });
  } catch (error) {
    next(error);
  }
}

async function resetUserPassword(req, res, next) {
  try {
    await resetPassword({
      token: req.body.token,
      password: req.body.password,
    });

    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message:
        "Ton mot de passe a été réinitialisé. Tu peux maintenant te connecter.",
    });
  } catch (error) {
    clearAuthCookies(res);
    next(error);
  }
}

async function changeCurrentUserPassword(req, res, next) {
  try {
    await changeUserPassword({
      userId: req.auth.user._id,
      currentSessionId: req.auth.session._id,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    });

    res.status(200).json({
      success: true,
      message:
        "Mot de passe modifié. Les autres appareils ont été déconnectés.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  forgotPassword,
  resetUserPassword,
  changeCurrentUserPassword,
};
