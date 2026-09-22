const { z } = require("zod");

const deleteAccountSchema = z.object({
  confirmation: z.literal("SUPPRIMER", {
    error: "La confirmation SUPPRIMER est obligatoire.",
  }),
});

module.exports = { deleteAccountSchema };
