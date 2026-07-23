const { z } = require("zod");
const updateConsentSchema = z
  .object({
    newsletter: z.boolean().optional(),
    commercialEmail: z.boolean().optional(),
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Au moins un consentement doit être renseigné.",
  );
module.exports = { updateConsentSchema };
