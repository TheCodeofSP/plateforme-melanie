const { z } = require("zod");

const createIntervenantExitRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .max(1000, "Le message ne peut pas dépasser 1 000 caractères.")
    .optional()
    .transform((value) => value || null),
});

const intervenantExitDecisionSchema = z.object({
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

const intervenantExitRequestIdSchema = z.object({
  requestId: z
    .string()
    .regex(/^[a-f0-9]{24}$/i, "L’identifiant de la demande est invalide."),
});

module.exports = {
  createIntervenantExitRequestSchema,
  intervenantExitDecisionSchema,
  intervenantExitRequestIdSchema,
};
