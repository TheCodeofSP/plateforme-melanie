const { z } = require("zod");

const requestEmailChangeSchema = z.object({
  newEmail: z.email("La nouvelle adresse email est invalide."),

  currentPassword: z.string().min(1, "Le mot de passe actuel est obligatoire."),
});

module.exports = { requestEmailChangeSchema };
