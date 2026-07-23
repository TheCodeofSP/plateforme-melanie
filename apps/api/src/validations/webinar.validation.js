const { z } = require("zod");
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Identifiant invalide.");
const plain = (min, max) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .refine((v) => !/<[^>]*>/.test(v), "Le HTML n’est pas autorisé.");
const optionalUrl = z.union([z.url(), z.literal(""), z.null()]).optional();
const webinarIdSchema = z.object({ webinarId: objectId });
const sessionIdSchema = z.object({ sessionId: objectId });
const registrationIdSchema = z.object({ registrationId: objectId });
const questionIdSchema = z.object({ questionId: objectId });
const paginationSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();
const webinarCreateSchema = z
  .object({
    title: plain(3, 180),
    shortDescription: plain(10, 350),
    description: plain(20, 12000),
    imageId: objectId.nullable().optional(),
    recommendedProfiles: z
      .array(
        z.enum([
          "BOULE_DE_NERFS",
          "CROQUE_TOUT",
          "DOUCE_MELANCOLIE",
          "GONFLEE_A_BLOC",
        ]),
      )
      .max(2)
      .default([]),
  })
  .strict();
const webinarUpdateSchema = webinarCreateSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Aucune modification fournie.");
const sessionCreateSchema = z
  .object({
    startsAt: z.coerce.date(),
    durationMinutes: z.coerce.number().int().min(15).max(480),
    timezone: z.string().trim().min(1).max(80).default("Europe/Paris"),
    capacity: z.coerce.number().int().min(1).max(10000),
    meetUrl: optionalUrl,
  })
  .strict();
const sessionUpdateSchema = sessionCreateSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Aucune modification fournie.");
const changeSessionSchema = z.object({ sessionId: objectId }).strict();
const adminRegistrationSchema = z
  .object({ userId: objectId, capacityOverride: z.boolean().default(false) })
  .strict();
const attendanceSchema = z
  .object({ status: z.enum(["PRESENT", "ABSENT"]) })
  .strict();
const questionSchema = z.object({ content: plain(2, 2000) }).strict();
const questionStatusSchema = z
  .object({ status: z.enum(["OPEN", "ANSWERED", "ARCHIVED", "DELETED"]) })
  .strict();
const evaluationSchema = z
  .object({
    rating: z.coerce.number().int().min(1).max(5),
    useful: z.boolean(),
    comment: plain(0, 3000).default(""),
    testimonialConsent: z.boolean().default(false),
  })
  .strict();
const replaySchema = z
  .object({ url: optionalUrl, available: z.boolean() })
  .strict();
const statusSchema = z
  .object({
    status: z.enum(["PUBLISHED", "COMPLETED", "CANCELLED", "ARCHIVED"]),
  })
  .strict();
const listSchema = paginationSchema
  .extend({
    status: z
      .enum(["DRAFT", "PUBLISHED", "COMPLETED", "CANCELLED", "ARCHIVED"])
      .optional(),
    profile: z
      .enum([
        "BOULE_DE_NERFS",
        "CROQUE_TOUT",
        "DOUCE_MELANCOLIE",
        "GONFLEE_A_BLOC",
      ])
      .optional(),
    q: z.string().trim().max(100).optional(),
  })
  .strict();
module.exports = {
  webinarIdSchema,
  sessionIdSchema,
  registrationIdSchema,
  questionIdSchema,
  paginationSchema,
  webinarCreateSchema,
  webinarUpdateSchema,
  sessionCreateSchema,
  sessionUpdateSchema,
  changeSessionSchema,
  adminRegistrationSchema,
  attendanceSchema,
  questionSchema,
  questionStatusSchema,
  evaluationSchema,
  replaySchema,
  statusSchema,
  listSchema,
};
