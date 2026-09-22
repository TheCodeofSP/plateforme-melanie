const { registerUser } = require("../../services/auth");

async function register(req, res, next) {
  try {
    const result = await registerUser(req.body);

    const message = result.emailsAccepted
      ? "Compte créé. Consultez vos emails pour poursuivre son activation."
      : "Compte créé, mais la demande d’envoi n’a pas été acceptée. Vous pourrez demander un nouveau lien.";
    res.status(201).json({
      success: true,
      message,
      emailsAccepted: result.emailsAccepted,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
};
