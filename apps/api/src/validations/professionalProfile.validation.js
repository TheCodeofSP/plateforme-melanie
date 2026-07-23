const { z } = require("zod");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Identifiant invalide.");
const nullableUrl = z
  .union([z.url("URL invalide."), z.literal(""), z.null()])
  .optional()
  .transform((value) => value || null);

const profileVersionSchema = z
  .object({
    professionalName: z.string().trim().max(120).optional(),
    displayedFirstName: z.string().trim().max(80).optional(),
    displayedLastName: z.string().trim().max(80).optional(),
    profession: z.string().trim().max(120).optional(),
    specialties: z.array(z.string().trim().min(2).max(100)).max(10).optional(),
    shortPresentation: z.string().trim().max(500).optional(),
    biography: z.string().trim().max(5000).optional(),
    photo: z.union([objectId, z.null()]).optional(),
    website: nullableUrl,
  })
  .strict();

const submitProfileSchema = z.object({}).strict();
const adminCommentSchema = z
  .object({ comment: z.string().trim().min(2).max(1000) })
  .strict();
const optionalAdminCommentSchema = z
  .object({
    comment: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .transform((v) => v || null),
  })
  .strict();
const editorialCorrectionSchema = z
  .object({
    changes: profileVersionSchema,
    comment: z.string().trim().min(2).max(1000),
  })
  .strict();
const profileIdSchema = z.object({ profileId: objectId });
const publicListSchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    profession: z.string().trim().max(120).optional(),
    specialty: z.string().trim().max(100).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  })
  .strict();
const adminListSchema = z
  .object({
    reviewStatus: z
      .enum([
        "NOT_SUBMITTED",
        "PENDING_REVIEW",
        "CHANGES_REQUESTED",
        "APPROVED",
      ])
      .optional(),
    publicationStatus: z.enum(["DRAFT", "PUBLISHED", "HIDDEN"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

module.exports = {
  profileVersionSchema,
  submitProfileSchema,
  adminCommentSchema,
  optionalAdminCommentSchema,
  editorialCorrectionSchema,
  profileIdSchema,
  publicListSchema,
  adminListSchema,
};
