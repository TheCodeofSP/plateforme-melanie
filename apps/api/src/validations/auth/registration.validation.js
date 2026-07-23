const { z } = require("zod");
const { calculateAge } = require("../../utils/age.utils");
const { passwordSchema, isValidDate } = require("./shared.validation");

const registerSchema = z
  .object({
    email: z.email("L’adresse email est invalide."),

    firstName: z
      .string()
      .trim()
      .min(2, "Le prénom doit contenir au moins 2 caractères.")
      .max(80, "Le prénom ne peut pas dépasser 80 caractères."),

    lastName: z
      .string()
      .trim()
      .min(2, "Le nom doit contenir au moins 2 caractères.")
      .max(80, "Le nom ne peut pas dépasser 80 caractères."),

    pseudonym: z
      .string()
      .trim()
      .min(3, "Le pseudonyme doit contenir au moins 3 caractères.")
      .max(30, "Le pseudonyme ne peut pas dépasser 30 caractères.")
      .regex(
        /^[\p{L}\p{N} _'’-]+$/u,
        "Le pseudonyme contient des caractères non autorisés.",
      ),

    dateOfBirth: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "La date de naissance doit être au format AAAA-MM-JJ.",
      )
      .refine(isValidDate, "La date de naissance est invalide."),

    password: passwordSchema,

    passwordConfirmation: z.string(),

    guardianEmail: z
      .union([
        z.email("L’adresse email du responsable légal est invalide."),
        z.literal(""),
      ])
      .optional()
      .transform((value) => value || undefined),

    hasAcceptedTerms: z.literal(true, {
      error: "Les CGU doivent être acceptées.",
    }),

    hasAcknowledgedPrivacyPolicy: z.literal(true, {
      error: "La politique de confidentialité doit être consultée.",
    }),

    newsletterConsent: z.boolean().default(false),

    commercialEmailConsent: z.boolean().default(false),
  })
  .superRefine((data, context) => {
    const age = calculateAge(data.dateOfBirth);

    if (age < 0) {
      context.addIssue({
        code: "custom",
        path: ["dateOfBirth"],
        message: "La date de naissance ne peut pas être dans le futur.",
      });

      return;
    }

    if (age < 15) {
      context.addIssue({
        code: "custom",
        path: ["dateOfBirth"],
        message: "Il faut avoir au moins 15 ans pour créer un compte.",
      });
    }

    if (age >= 15 && age < 18 && !data.guardianEmail) {
      context.addIssue({
        code: "custom",
        path: ["guardianEmail"],
        message:
          "L’adresse email d’un responsable légal est obligatoire pour une personne mineure.",
      });
    }

    if (
      data.guardianEmail &&
      data.guardianEmail.toLowerCase() === data.email.toLowerCase()
    ) {
      context.addIssue({
        code: "custom",
        path: ["guardianEmail"],
        message:
          "L’adresse du responsable légal doit être différente de celle de la membre.",
      });
    }

    if (data.password !== data.passwordConfirmation) {
      context.addIssue({
        code: "custom",
        path: ["passwordConfirmation"],
        message: "Les mots de passe ne correspondent pas.",
      });
    }
  });

module.exports = { registerSchema };
