const { z } = require("zod");

const requestEmailChangeSchema = z.object({
  newEmail: z.email("La nouvelle adresse email est invalide."),
});

module.exports = { requestEmailChangeSchema };
