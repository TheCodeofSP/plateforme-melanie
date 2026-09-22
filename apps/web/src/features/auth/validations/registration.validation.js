const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PSEUDONYM_PATTERN = /^[\p{L}\p{N} _'’-]+$/u;

export function validateRegistrationStep(step, values) {
  const errors = {};

  if (step === 0) {
    if (values.firstName.trim().length < 2)
      errors.firstName = "Indique au moins 2 caractères.";
    if (values.lastName.trim().length < 2)
      errors.lastName = "Indique au moins 2 caractères.";
    if (values.pseudonym.trim().length < 3)
      errors.pseudonym = "Choisis au moins 3 caractères.";
    else if (!PSEUDONYM_PATTERN.test(values.pseudonym.trim())) {
      errors.pseudonym = "Ce pseudonyme contient un caractère non autorisé.";
    }
    if (!values.isAdultConfirmed)
      errors.isAdultConfirmed =
        "La création d’un compte est réservée aux personnes majeures dans cette version. Les inscriptions de mineures sont reportées à une prochaine version.";
  }

  if (step === 1) {
    if (!EMAIL_PATTERN.test(values.email))
      errors.email = "Indique une adresse email valide.";
  }

  if (step === 2) {
    if (!values.hasAcceptedTerms)
      errors.hasAcceptedTerms =
        "Tu dois accepter les conditions d’utilisation.";
    if (!values.hasAcknowledgedPrivacyPolicy) {
      errors.hasAcknowledgedPrivacyPolicy =
        "Tu dois confirmer avoir lu la politique de confidentialité.";
    }
    if (!values.newsletterConsent)
      errors.newsletterConsent =
        "L’inscription à la newsletter est requise dans cette V1.";
  }

  return errors;
}
