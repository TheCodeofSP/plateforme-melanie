const { z } = require("zod");
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Identifiant invalide.");
const emptySchema = z.object({}).strict();
const noHtml = (schema) =>
  schema.refine(
    (value) => !/<\/?[a-z][\s\S]*>/i.test(value),
    "Le HTML n’est pas autorisé.",
  );
const categoryIdSchema = z.object({ categoryId: objectId });
const postIdSchema = z.object({ postId: objectId });
const commentIdSchema = z.object({ commentId: objectId });
const reportIdSchema = z.object({ reportId: objectId });
const userIdSchema = z.object({ userId: objectId });
const suspensionIdSchema = z.object({ suspensionId: objectId });
const notificationIdSchema = z.object({ notificationId: objectId });
const mediaIdSchema = z.object({ mediaId: objectId });
const categoryCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().min(5).max(500),
    displayOrder: z.number().int().min(0).default(0),
    allowNewPosts: z.boolean().default(true),
    adminOnly: z.boolean().default(false),
    allowComments: z.boolean().default(true),
    allowReactions: z.boolean().default(true),
  })
  .strict();
const categoryUpdateSchema = categoryCreateSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Au moins un champ doit être modifié.",
  );
const linkSchema = z
  .object({ label: z.string().trim().min(1).max(120), url: z.url().max(1000) })
  .strict();
const postImageSchema = z
  .object({ media: objectId, alt: z.string().trim().min(2).max(300) })
  .strict();
const postCreateSchema = z
  .object({
    categoryId: objectId,
    title: noHtml(z.string().trim().min(5).max(180)),
    content: noHtml(z.string().trim().min(10).max(10000)),
    links: z.array(linkSchema).max(3).default([]),
    images: z.array(postImageSchema).max(3).default([]),
    allowComments: z.boolean().optional(),
    allowReactions: z.boolean().optional(),
    notifyMembers: z.boolean().optional(),
  })
  .strict();
const postUpdateSchema = z
  .object({
    title: noHtml(z.string().trim().min(5).max(180)).optional(),
    content: noHtml(z.string().trim().min(10).max(10000)).optional(),
    links: z.array(linkSchema).max(3).optional(),
    images: z.array(postImageSchema).max(3).optional(),
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Au moins un champ doit être modifié.",
  );
const commentSchema = z
  .object({ content: noHtml(z.string().trim().min(1).max(5000)) })
  .strict();
const reactionSchema = z
  .object({ type: z.enum(["SUPPORT", "THANK_YOU", "ME_TOO", "HELPFUL"]) })
  .strict();
const reportSchema = z
  .object({
    targetType: z.enum(["POST", "COMMENT"]),
    targetId: objectId,
    reason: z.enum([
      "OFFENSIVE",
      "HARASSMENT",
      "MEDICAL_MISINFORMATION",
      "SPAM_SOLICITATION",
      "INAPPROPRIATE",
      "DANGER",
      "OTHER",
    ]),
    details: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .transform((v) => v || null),
  })
  .strict();
const adminReasonSchema = z
  .object({ reason: z.string().trim().min(2).max(2000) })
  .strict();
const optionalReasonSchema = z
  .object({
    reason: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .transform((v) => v || null),
  })
  .strict();
const warningSchema = z
  .object({
    text: z
      .string()
      .trim()
      .min(5)
      .max(1000)
      .default(
        "Ce témoignage reflète une expérience personnelle et ne remplace pas un avis médical.",
      ),
  })
  .strict();
const moveCategorySchema = z
  .object({
    categoryId: objectId,
    reason: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .transform((v) => v || null),
  })
  .strict();
const correctionDecisionSchema = z
  .object({
    decision: z.enum(["APPROVE", "REQUEST_CHANGES", "REJECT"]),
    comment: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .transform((v) => v || null),
  })
  .strict();
const suspendSchema = z
  .object({
    reason: z.string().trim().min(2).max(2000),
    endsAt: z.coerce.date().nullable().optional(),
  })
  .strict()
  .refine((v) => !v.endsAt || v.endsAt > new Date(), {
    path: ["endsAt"],
    message: "La date de fin doit être future.",
  });
const notificationPreferenceSchema = z
  .object({ safePlaceReactions: z.boolean() })
  .strict();
const broadcastSchema = z
  .object({
    postId: objectId,
    title: z.string().trim().min(2).max(180),
    message: z.string().trim().min(2).max(1000),
  })
  .strict();
const paginationSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();
const postListSchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    category: objectId.optional(),
    author: z.string().trim().max(80).optional(),
    sort: z.enum(["recent", "active", "pinned"]).default("recent"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict();
const moderationListSchema = z
  .object({
    targetType: z.enum(["POST", "COMMENT"]).optional(),
    reason: z
      .enum([
        "OFFENSIVE",
        "HARASSMENT",
        "MEDICAL_MISINFORMATION",
        "SPAM_SOLICITATION",
        "INAPPROPRIATE",
        "DANGER",
        "OTHER",
      ])
      .optional(),
    category: objectId.optional(),
    status: z
      .enum([
        "OPEN",
        "IN_REVIEW",
        "WAITING_CORRECTION",
        "RESOLVED",
        "REJECTED",
        "PENDING_CORRECTION",
        "PENDING_REVIEW",
      ])
      .optional(),
    priority: z.enum(["NORMAL", "HIGH", "CRITICAL"]).optional(),
    pseudonym: z.string().trim().max(80).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    sort: z.enum(["priority", "oldest", "newest"]).default("priority"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();
const statsQuerySchema = z
  .object({
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    category: objectId.optional(),
    granularity: z.enum(["day", "week", "month"]).default("day"),
  })
  .strict();
const suspensionListSchema = z
  .object({
    status: z.enum(["ACTIVE", "EXPIRED", "LIFTED"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();
module.exports = {
  objectId,
  emptySchema,
  categoryIdSchema,
  postIdSchema,
  commentIdSchema,
  reportIdSchema,
  userIdSchema,
  suspensionIdSchema,
  notificationIdSchema,
  mediaIdSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  postCreateSchema,
  postUpdateSchema,
  commentSchema,
  reactionSchema,
  reportSchema,
  adminReasonSchema,
  optionalReasonSchema,
  warningSchema,
  moveCategorySchema,
  correctionDecisionSchema,
  suspendSchema,
  notificationPreferenceSchema,
  broadcastSchema,
  paginationSchema,
  postListSchema,
  moderationListSchema,
  statsQuerySchema,
  suspensionListSchema,
};
