const { z } = require("zod");
const { passwordSchema } = require("./shared.validation");

const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .length(64, "Le jeton de réinitialisation est invalide.")
      .regex(/^[a-f0-9]+$/i, "Le jeton de réinitialisation est invalide."),

    password: passwordSchema,

    passwordConfirmation: z.string(),
  })
  .superRefine((data, context) => {
    if (data.password !== data.passwordConfirmation) {
      context.addIssue({
        code: "custom",
        path: ["passwordConfirmation"],
        message: "Les mots de passe ne correspondent pas.",
      });
    }
  });

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Le mot de passe actuel est obligatoire."),

    newPassword: passwordSchema,

    newPasswordConfirmation: z.string(),
  })
  .superRefine((data, context) => {
    if (data.newPassword !== data.newPasswordConfirmation) {
      context.addIssue({
        code: "custom",
        path: ["newPasswordConfirmation"],
        message: "Les nouveaux mots de passe ne correspondent pas.",
      });
    }

    if (data.currentPassword === data.newPassword) {
      context.addIssue({
        code: "custom",
        path: ["newPassword"],
        message:
          "Le nouveau mot de passe doit être différent du mot de passe actuel.",
      });
    }
  });

module.exports = { resetPasswordSchema, changePasswordSchema };
