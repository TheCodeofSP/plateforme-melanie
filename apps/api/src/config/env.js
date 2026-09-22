const { z } = require("zod");

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    APP_ENV: z
      .enum(["local", "test", "staging", "production"])
      .default("local"),

    PORT: z.coerce.number().int().positive().default(5100),

    MONGO_URI: z
      .string()
      .min(1, "MONGO_URI est obligatoire.")
      .refine(
        (value) =>
          value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"),
        "MONGO_URI doit être une URI MongoDB valide.",
      ),
    MONGO_TEST_URI: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z
        .string()
        .refine(
          (value) =>
            value.startsWith("mongodb://") ||
            value.startsWith("mongodb+srv://"),
          "MONGO_TEST_URI doit être une URI MongoDB valide.",
        )
        .optional(),
    ),

    CLIENT_URL: z.url("CLIENT_URL doit être une URL valide."),
    ALLOWED_ORIGINS: z.string().default(""),
    VERCEL_PREVIEW_HOST_SUFFIX: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().trim().min(3).optional(),
    ),
    ALLOW_TEST_DATABASE_RESET: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    ALLOW_STAGING_RESET: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    STAGING_RESET_CONFIRMATION: z.string().optional(),
    EMAIL_PROVIDER: z.literal("resend").default("resend"),
    EMAIL_MODE: z.enum(["capture", "resend"]).default("capture"),
    EMAIL_CONTACT_SYNC_ENABLED: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY est obligatoire."),
    RESEND_FROM_EMAIL: z.email(
      "RESEND_FROM_EMAIL doit être une adresse email valide.",
    ),
    RESEND_FROM_NAME: z
      .string()
      .trim()
      .min(1, "RESEND_FROM_NAME est obligatoire."),
    RESEND_DEVELOPMENT_RECIPIENT: z.email(
      "RESEND_DEVELOPMENT_RECIPIENT doit être une adresse email valide.",
    ),
    RESEND_QUIZ_SEGMENT_ID: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().uuid().optional(),
    ),
    RESEND_NEWSLETTER_SEGMENT_ID: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().uuid().optional(),
    ),
    RESEND_COMMERCIAL_SEGMENT_ID: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().uuid().optional(),
    ),
    RESEND_WEBHOOK_SECRET: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().min(20).optional(),
    ),
    CRON_SECRET: z
      .string()
      .min(32, "CRON_SECRET doit contenir au moins 32 caractères.")
      .optional(),

    JWT_ACCESS_SECRET: z
      .string()
      .min(64, "JWT_ACCESS_SECRET doit contenir au moins 64 caractères."),

    CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_API_SECRET: z.string().min(1).optional(),
    CLOUDINARY_FOLDER_PREFIX: z
      .string()
      .trim()
      .default("plateforme-melanie/local"),
  })
  .superRefine((value, context) => {
    if (value.APP_ENV !== "production") return;
    if (value.EMAIL_MODE === "capture") {
      context.addIssue({
        code: "custom",
        path: ["EMAIL_MODE"],
        message: "EMAIL_MODE=capture est interdit en production.",
      });
    }
    if (value.RESEND_FROM_EMAIL.endsWith("@resend.dev")) {
      context.addIssue({
        code: "custom",
        path: ["RESEND_FROM_EMAIL"],
        message: "Un domaine Resend vérifié est obligatoire en production.",
      });
    }
    if (!value.CRON_SECRET) {
      context.addIssue({
        code: "custom",
        path: ["CRON_SECRET"],
        message: "CRON_SECRET est obligatoire en production.",
      });
    }
    if (/local|test|staging/i.test(value.CLOUDINARY_FOLDER_PREFIX)) {
      context.addIssue({
        code: "custom",
        path: ["CLOUDINARY_FOLDER_PREFIX"],
        message: "Le dossier Cloudinary de production est invalide.",
      });
    }
  });

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Variables d’environnement invalides :");

  result.error.issues.forEach((issue) => {
    console.error(`- ${issue.path.join(".")} : ${issue.message}`);
  });

  process.exit(1);
}

module.exports = result.data;
