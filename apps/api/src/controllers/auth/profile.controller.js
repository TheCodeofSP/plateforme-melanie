const { updateUserProfile } = require("../../services/auth");
const {
  setAuthCookies,
  clearAuthCookies,
} = require("../../services/cookie.service");

async function updateCurrentUser(req, res, next) {
  try {
    const user = await updateUserProfile(req.auth.user, req.body);

    res.status(200).json({
      success: true,
      message: "Profil mis à jour.",
      user,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  updateCurrentUser,
};
