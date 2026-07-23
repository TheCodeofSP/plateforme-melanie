const { z } = require("zod");

const tokenSchema = z.object({
  token: z
    .string()
    .length(64, "Le jeton de validation est invalide.")
    .regex(/^[a-f0-9]+$/i, "Le jeton de validation est invalide."),
});

const parentalAuthorizationResponseSchema = z.object({
  token: z
    .string()
    .length(64, "Le jeton d’autorisation est invalide.")
    .regex(/^[a-f0-9]+$/i, "Le jeton d’autorisation est invalide."),

  decision: z.enum(["APPROVE", "DECLINE"], {
    error: "La décision doit être APPROVE ou DECLINE.",
  }),
});

const resendActivationSchema = z.object({
  email: z.email("L’adresse email est invalide."),
});

module.exports = {
  tokenSchema,
  parentalAuthorizationResponseSchema,
  resendActivationSchema,
};
