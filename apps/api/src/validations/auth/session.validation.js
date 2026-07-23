const { z } = require("zod");

const loginSchema = z.object({
  email: z.email("L’adresse email est invalide."),

  password: z.string().min(1, "Le mot de passe est obligatoire."),

  rememberMe: z.boolean().default(false),
});

const sessionIdSchema = z.object({
  sessionId: z
    .string()
    .regex(/^[a-f0-9]{24}$/i, "L’identifiant de session est invalide."),
});

module.exports = { loginSchema, sessionIdSchema };
