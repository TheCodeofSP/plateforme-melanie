require("dotenv").config();

const mongoose = require("mongoose");
const { z } = require("zod");

const connectDatabase = require(
  "../config/db",
);

const User = require("../models/User");

const {
  passwordSchema,
} = require("../validations/auth.validation");

const {
  hashPassword,
} = require("../services/password.service");

const adminDataSchema = z.object({
  ADMIN_EMAIL: z.email(
    "ADMIN_EMAIL est invalide.",
  ),

  ADMIN_FIRST_NAME: z
    .string()
    .trim()
    .min(2)
    .max(80),

  ADMIN_LAST_NAME: z
    .string()
    .trim()
    .min(2)
    .max(80),

  ADMIN_PSEUDONYM: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[\p{L}\p{N} _'’-]+$/u),

  ADMIN_DATE_OF_BIRTH: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/),

  ADMIN_PASSWORD: passwordSchema,
});

async function createAdmin() {
  const validation =
    adminDataSchema.safeParse(process.env);

  if (!validation.success) {
    console.error(
      "❌ Variables administrateur invalides :",
    );

    validation.error.issues.forEach(
      (issue) => {
        console.error(
          `- ${issue.path.join(".")} : ${issue.message}`,
        );
      },
    );

    process.exitCode = 1;
    return;
  }

  const {
    ADMIN_EMAIL,
    ADMIN_FIRST_NAME,
    ADMIN_LAST_NAME,
    ADMIN_PSEUDONYM,
    ADMIN_DATE_OF_BIRTH,
    ADMIN_PASSWORD,
  } = validation.data;

  await connectDatabase();

  const existingEmail = await User.exists({
    email: ADMIN_EMAIL.toLowerCase(),
  });

  if (existingEmail) {
    throw new Error(
      "Un compte existe déjà avec cet email.",
    );
  }

  const existingPseudonym = await User.findOne({
    pseudonym: ADMIN_PSEUDONYM,
  })
    .collation({
      locale: "fr",
      strength: 2,
    })
    .select("_id")
    .lean();

  if (existingPseudonym) {
    throw new Error(
      "Ce pseudonyme est déjà utilisé.",
    );
  }

  const passwordHash = await hashPassword(
    ADMIN_PASSWORD,
  );

  await User.create({
    email: ADMIN_EMAIL,
    firstName: ADMIN_FIRST_NAME,
    lastName: ADMIN_LAST_NAME,
    pseudonym: ADMIN_PSEUDONYM,
    dateOfBirth: new Date(
      `${ADMIN_DATE_OF_BIRTH}T00:00:00.000Z`,
    ),
    passwordHash,
    role: "ADMIN",
    accountStatus: "ACTIVE",
    emailVerifiedAt: new Date(),
  });

  console.log(
    "✅ Compte administrateur créé",
  );
}

createAdmin()
  .catch((error) => {
    console.error(
      "❌ Création impossible :",
      error.message,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });