const { z } = require("zod");

const updateProfileSchema = z
  .object({
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
  .refine((data) => data.pseudonym !== undefined, {
    message: "Au moins une information doit être modifiée.",
  });

module.exports = { updateProfileSchema };
