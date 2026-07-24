const {
  registerUser,
} = require("../../services/auth");
const { setAuthCookies, clearAuthCookies } = require("../../services/cookie.service");

async function register(req, res, next) {
  try {
    const result = await registerUser(req.body);

    const message = result.emailsAccepted
      ? "Compte créé. Consultez vos emails pour poursuivre son activation."
      : "Compte créé, mais la demande d’envoi n’a pas été acceptée. Vous pourrez demander un nouveau lien.";
    res.status(201).json({
      success: true,
      message,
      requiresParentalAuthorization: result.requiresParentalAuthorization,
      emailsAccepted: result.emailsAccepted,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
};
