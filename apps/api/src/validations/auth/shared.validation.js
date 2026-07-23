const { z } = require("zod");

const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .max(128, "Le mot de passe ne peut pas dépasser 128 caractères.")
  .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule.")
  .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule.")
  .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre.")
  .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir un caractère spécial.");

function isValidDate(dateString) {
  const date = new Date(`${dateString}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === dateString
  );
}

module.exports = { passwordSchema, isValidDate };
