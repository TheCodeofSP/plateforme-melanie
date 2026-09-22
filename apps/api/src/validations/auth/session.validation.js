const { z } = require("zod");

const loginSchema = z.object({
  email: z.email("L’adresse email est invalide."),
});

const loginLinkSchema = z.object({
  token: z.string().min(32, "Le lien de connexion est incomplet."),
});

const sessionIdSchema = z.object({
  sessionId: z
    .string()
    .regex(/^[a-f0-9]{24}$/i, "L’identifiant de session est invalide."),
});

module.exports = { loginSchema, loginLinkSchema, sessionIdSchema };
