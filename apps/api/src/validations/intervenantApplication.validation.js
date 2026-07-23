const { z } = require("zod");

const optionalUrlSchema = z
  .union([z.url("Le lien renseigné est invalide."), z.literal(""), z.null()])
  .optional();

const updateIntervenantApplicationSchema = z
  .object({
    professionalName: z
      .string()
      .trim()
      .max(120, "Le nom professionnel ne peut pas dépasser 120 caractères.")
      .optional(),

    profession: z
      .string()
      .trim()
      .max(120, "La profession ne peut pas dépasser 120 caractères.")
      .optional(),

    specialties: z
      .array(
        z
          .string()
          .trim()
          .min(2, "Chaque spécialité doit contenir au moins 2 caractères.")
          .max(100, "Une spécialité ne peut pas dépasser 100 caractères."),
      )
      .max(10, "Il est possible de renseigner au maximum 10 spécialités.")
      .optional(),

    presentation: z
      .string()
      .trim()
      .max(2000, "La présentation ne peut pas dépasser 2 000 caractères.")
      .optional(),

    motivations: z
      .string()
      .trim()
      .max(2000, "Les motivations ne peuvent pas dépasser 2 000 caractères.")
      .optional(),

    links: z
      .object({
        website: optionalUrlSchema,
        instagram: optionalUrlSchema,
        linkedin: optionalUrlSchema,
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins une information doit être modifiée.",
  });

const intervenantApplicationIdSchema = z.object({
  applicationId: z
    .string()
    .regex(/^[a-f0-9]{24}$/i, "L’identifiant de la demande est invalide."),
});

const submitIntervenantApplicationSchema = z.object({
  professionalName: z
    .string()
    .trim()
    .min(2, "Le nom professionnel doit contenir au moins 2 caractères.")
    .max(120, "Le nom professionnel ne peut pas dépasser 120 caractères."),

  profession: z
    .string()
    .trim()
    .min(2, "La profession doit contenir au moins 2 caractères.")
    .max(120, "La profession ne peut pas dépasser 120 caractères."),

  specialties: z
    .array(
      z
        .string()
        .trim()
        .min(2, "Chaque spécialité doit contenir au moins 2 caractères.")
        .max(100, "Une spécialité ne peut pas dépasser 100 caractères."),
    )
    .min(1, "Au moins une spécialité est obligatoire.")
    .max(10, "Il est possible de renseigner au maximum 10 spécialités."),

  presentation: z
    .string()
    .trim()
    .min(50, "La présentation doit contenir au moins 50 caractères.")
    .max(2000, "La présentation ne peut pas dépasser 2 000 caractères."),

  motivations: z
    .string()
    .trim()
    .min(50, "Les motivations doivent contenir au moins 50 caractères.")
    .max(2000, "Les motivations ne peuvent pas dépasser 2 000 caractères."),

  links: z
    .object({
      website: optionalUrlSchema,
      instagram: optionalUrlSchema,
      linkedin: optionalUrlSchema,
    })
    .optional(),
});

const intervenantApplicationDecisionSchema = z.object({
  decision: z.enum(["APPROVE", "DECLINE"], {
    error: "La décision doit être APPROVE ou DECLINE.",
  }),

  comment: z
    .string()
    .trim()
    .max(1000, "Le commentaire ne peut pas dépasser 1 000 caractères.")
    .optional()
    .transform((value) => value || null),
});

module.exports = {
  updateIntervenantApplicationSchema,
  submitIntervenantApplicationSchema,
  intervenantApplicationIdSchema,
  intervenantApplicationDecisionSchema,
};
