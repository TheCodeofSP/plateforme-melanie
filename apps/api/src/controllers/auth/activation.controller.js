const { resendEmailVerification, verifyEmail } = require("../../services/auth");

async function verifyEmailAddress(req, res, next) {
  try {
    await verifyEmail(req.body.token);
    res.status(200).json({
      success: true,
      message: "Adresse email validée. Ton compte est maintenant actif.",
      accountActivated: true,
    });
  } catch (error) {
    next(error);
  }
}

async function resendEmailVerificationLink(req, res, next) {
  try {
    await resendEmailVerification(req.body.email);
    res.status(200).json({
      success: true,
      message:
        "Si ce compte existe et nécessite encore cette validation, un nouveau lien a été envoyé.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { verifyEmailAddress, resendEmailVerificationLink };
