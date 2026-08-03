import {
  calculateAge,
  passwordChecks,
} from "../utils/registration.utils.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PSEUDONYM_PATTERN = /^[\p{L}\p{N} _'’-]+$/u;

export function validateRegistrationStep(step, values) {
  const errors = {};

  if (step === 0) {
    if (values.firstName.trim().length < 2) errors.firstName = "Indique au moins 2 caractères.";
    if (values.lastName.trim().length < 2) errors.lastName = "Indique au moins 2 caractères.";
    if (values.pseudonym.trim().length < 3) errors.pseudonym = "Choisis au moins 3 caractères.";
    else if (!PSEUDONYM_PATTERN.test(values.pseudonym.trim())) {
      errors.pseudonym = "Ce pseudonyme contient un caractère non autorisé.";
    }
    const age = calculateAge(values.dateOfBirth);
    if (age === null) errors.dateOfBirth = "Indique ta date de naissance.";
    else if (age < 0) errors.dateOfBirth = "La date de naissance ne peut pas être dans le futur.";
    else if (age < 15) errors.dateOfBirth = "Il faut avoir au moins 15 ans pour créer un compte.";
    if (age >= 15 && age < 18 && !EMAIL_PATTERN.test(values.guardianEmail)) {
      errors.guardianEmail = "Indique une adresse email valide pour ton responsable légal.";
    }
    if (
      values.guardianEmail &&
      values.guardianEmail.toLowerCase() === values.email.toLowerCase()
    ) {
      errors.guardianEmail = "Cette adresse doit être différente de la tienne.";
    }
  }

  if (step === 1) {
    if (!EMAIL_PATTERN.test(values.email)) errors.email = "Indique une adresse email valide.";
    const checks = passwordChecks(values.password);
    if (!Object.values(checks).every(Boolean)) {
      errors.password = "Le mot de passe ne respecte pas encore toutes les règles.";
    }
    if (values.passwordConfirmation !== values.password) {
      errors.passwordConfirmation = "Les mots de passe ne correspondent pas.";
    }
  }

  if (step === 2) {
    if (!values.hasAcceptedTerms) errors.hasAcceptedTerms = "Tu dois accepter les conditions d’utilisation.";
    if (!values.hasAcknowledgedPrivacyPolicy) {
      errors.hasAcknowledgedPrivacyPolicy = "Tu dois confirmer avoir lu la politique de confidentialité.";
    }
  }

  return errors;
}
