const { z } = require("zod");

const deleteAccountSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est obligatoire."),

  confirmation: z.literal("SUPPRIMER", {
    error: "La confirmation SUPPRIMER est obligatoire.",
  }),
});

module.exports = { deleteAccountSchema };
