const { anonymizeUserAccount } = require("../../services/auth");
const { clearAuthCookies } = require("../../services/cookie.service");

async function deleteCurrentUserAccount(req, res, next) {
  try {
    await anonymizeUserAccount({
      userId: req.auth.user._id,
    });

    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message:
        "Ton compte a été supprimé et tes données personnelles ont été anonymisées.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  deleteCurrentUserAccount,
};
