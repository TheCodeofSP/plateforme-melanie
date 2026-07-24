const { z } = require("zod");

const adminUserIdSchema = z.object({
  userId: z
    .string()
    .regex(/^[a-f0-9]{24}$/i, "L’identifiant du compte est invalide."),
});

const adminAccountActionSchema = z.object({
  comment: z
    .string()
    .trim()
    .max(1000, "Le commentaire ne peut pas dépasser 1 000 caractères.")
    .optional()
    .transform((value) => value || null),
});

const adminAnonymizeAccountSchema = z.object({
  confirmation: z.literal("ANONYMISER", {
    error: "La confirmation ANONYMISER est obligatoire.",
  }),

  comment: z
    .string()
    .trim()
    .max(1000, "Le commentaire ne peut pas dépasser 1 000 caractères.")
    .optional()
    .transform((value) => value || null),
});

const adminUserListSchema = z.object({
  q: z.string().trim().max(120).optional(),
  role: z.enum(["MEMBER", "INTERVENANT", "ADMIN"]).optional(),
  accountStatus: z.enum(["PENDING_ACTIVATION", "ACTIVE", "SUSPENDED", "ANONYMIZED"]).optional(),
  quizCompleted: z.enum(["true", "false"]).optional(),
  isMinor: z.enum(["true", "false"]).optional(),
  sort: z.enum(["newest", "oldest", "lastLogin", "name"]).default("newest"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

module.exports = {
  adminUserIdSchema,
  adminAccountActionSchema,
  adminAnonymizeAccountSchema,
  adminUserListSchema,
};
