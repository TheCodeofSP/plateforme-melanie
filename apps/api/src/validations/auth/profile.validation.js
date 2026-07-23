const { z } = require("zod");

const updateProfileSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "Le prénom doit contenir au moins 2 caractères.")
      .max(80, "Le prénom ne peut pas dépasser 80 caractères.")
      .optional(),

    lastName: z
      .string()
      .trim()
      .min(2, "Le nom doit contenir au moins 2 caractères.")
      .max(80, "Le nom ne peut pas dépasser 80 caractères.")
      .optional(),

    pseudonym: z
      .string()
      .trim()
      .min(3, "Le pseudonyme doit contenir au moins 3 caractères.")
      .max(30, "Le pseudonyme ne peut pas dépasser 30 caractères.")
      .regex(
        /^[\p{L}\p{N} _'’-]+$/u,
        "Le pseudonyme contient des caractères non autorisés.",
      )
      .optional(),
  })
  .refine(
    (data) =>
      data.firstName !== undefined ||
      data.lastName !== undefined ||
      data.pseudonym !== undefined,
    {
      message: "Au moins une information doit être modifiée.",
    },
  );

module.exports = { updateProfileSchema };
