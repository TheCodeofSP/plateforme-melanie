const {
  verifyEmail,
  getParentalAuthorizationDetails,
  respondToParentalAuthorization,
  resendEmailVerification,
  resendParentalAuthorization,
} = require("../../services/auth");
const {
  setAuthCookies,
  clearAuthCookies,
} = require("../../services/cookie.service");

async function verifyEmailAddress(req, res, next) {
  try {
    const result = await verifyEmail(req.body.token);

    let message;

    if (result.alreadyVerified) {
      message = "Cette adresse email a déjà été validée.";
    } else if (result.accountActivated) {
      message = "Adresse email validée. Ton compte est maintenant actif.";
    } else {
      message =
        "Adresse email validée. Le compte sera activé après l’autorisation du responsable légal.";
    }

    res.status(200).json({
      success: true,
      message,
      accountActivated: result.accountActivated,
    });
  } catch (error) {
    next(error);
  }
}

async function getParentalAuthorization(req, res, next) {
  try {
    const details = await getParentalAuthorizationDetails(req.body.token);

    res.status(200).json({
      success: true,
      authorization: details,
    });
  } catch (error) {
    next(error);
  }
}

async function respondToParentalAuthorizationRequest(req, res, next) {
  try {
    const result = await respondToParentalAuthorization(
      req.body.token,
      req.body.decision,
    );

    let message;

    if (result.alreadyAnswered) {
      message =
        result.status === "APPROVED"
          ? "Cette autorisation a déjà été acceptée."
          : "Cette autorisation a déjà été refusée.";
    } else if (result.status === "DECLINED") {
      message = "L’autorisation parentale a été refusée.";
    } else if (result.accountActivated) {
      message = "Autorisation confirmée. Le compte est maintenant actif.";
    } else {
      message =
        "Autorisation confirmée. Le compte sera activé après la validation de l’adresse email de la membre.";
    }

    res.status(200).json({
      success: true,
      message,
      authorizationStatus: result.status,
      accountActivated: result.accountActivated,
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

async function resendParentalAuthorizationLink(req, res, next) {
  try {
    await resendParentalAuthorization(req.body.email);

    res.status(200).json({
      success: true,
      message:
        "Si ce compte existe et nécessite encore cette validation, un nouveau lien a été envoyé.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  verifyEmailAddress,
  getParentalAuthorization,
  respondToParentalAuthorizationRequest,
  resendEmailVerificationLink,
  resendParentalAuthorizationLink,
};
