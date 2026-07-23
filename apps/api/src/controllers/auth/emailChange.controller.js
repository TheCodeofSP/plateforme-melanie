const {
  requestEmailChange,
  confirmEmailChange,
} = require("../../services/auth");
const {
  setAuthCookies,
  clearAuthCookies,
} = require("../../services/cookie.service");

async function requestCurrentUserEmailChange(req, res, next) {
  try {
    const result = await requestEmailChange({
      userId: req.auth.user._id,
      newEmail: req.body.newEmail,
      currentPassword: req.body.currentPassword,
    });

    res.status(200).json({
      success: true,
      message: result.emailsAccepted
        ? "Demande enregistrée. Consulte la nouvelle adresse email pour confirmer le changement."
        : "Demande enregistrée, mais au moins un email n’a pas été accepté par le service d’envoi.",
      emailsAccepted: result.emailsAccepted,
    });
  } catch (error) {
    next(error);
  }
}

async function confirmCurrentUserEmailChange(req, res, next) {
  try {
    await confirmEmailChange(req.body.token);

    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message:
        "Adresse email modifiée. Reconnecte-toi avec ta nouvelle adresse.",
    });
  } catch (error) {
    clearAuthCookies(res);
    next(error);
  }
}

module.exports = {
  requestCurrentUserEmailChange,
  confirmCurrentUserEmailChange,
};
