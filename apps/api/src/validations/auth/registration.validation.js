const { z } = require("zod");

const registerSchema = z.object({
  email: z.email("L’adresse email est invalide."),
  firstName: z
    .string()
    .trim()
    .min(2, "Le prénom doit contenir au moins 2 caractères.")
    .max(80),
  lastName: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(80),
  pseudonym: z
    .string()
    .trim()
    .min(3, "Le pseudonyme doit contenir au moins 3 caractères.")
    .max(30)
    .regex(
      /^[\p{L}\p{N} _'’-]+$/u,
      "Le pseudonyme contient des caractères non autorisés.",
    ),
  profileVisibility: z
    .enum(["PSEUDONYM_ONLY", "FIRST_NAME"])
    .default("PSEUDONYM_ONLY"),
  isAdultConfirmed: z.literal(true, {
    error:
      "La création d’un compte est réservée aux personnes majeures dans cette version.",
  }),
  hasAcceptedTerms: z.literal(true, {
    error: "Les CGU doivent être acceptées.",
  }),
  hasAcknowledgedPrivacyPolicy: z.literal(true, {
    error: "La politique de confidentialité doit être consultée.",
  }),
  newsletterConsent: z.literal(true, {
    error: "L’inscription à la newsletter est requise dans cette V1.",
  }),
  commercialEmailConsent: z.boolean().default(false),
});

module.exports = { registerSchema };
