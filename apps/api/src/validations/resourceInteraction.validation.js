const { z } = require("zod");
const { REPORT_REASONS } = require("../config/resource.constants");
const objectId = z.string().regex(/^[a-f\d]{24}$/i);
const commentSchema = z
  .object({ content: z.string().trim().min(1).max(2000) })
  .strict();
const reportSchema = z
  .object({
    targetType: z.enum(["RESOURCE", "COMMENT"]),
    resourceId: objectId,
    commentId: objectId.nullable().optional(),
    reason: z.enum(REPORT_REASONS),
    details: z.string().trim().max(2000).nullable().optional(),
  })
  .strict();
const moderationSchema = z
  .object({
    status: z.enum(["REJECTED", "RESOLVED"]),
    resolution: z.enum([
      "NONE",
      "CONTENT_KEPT",
      "CORRECTION_REQUESTED",
      "COMMENT_REMOVED",
      "RESOURCE_UNPUBLISHED",
      "RESOURCE_ARCHIVED",
    ]),
    comment: z.string().trim().max(2000).nullable().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.status === "REJECTED" && data.resolution !== "NONE")
      ctx.addIssue({
        code: "custom",
        path: ["resolution"],
        message: "Un signalement rejeté ne déclenche aucune action.",
      });
    if (data.status === "RESOLVED" && data.resolution === "NONE")
      ctx.addIssue({
        code: "custom",
        path: ["resolution"],
        message: "Choisis une décision de modération.",
      });
  });
const analyticsIdentitySchema = z
  .object({
    visitorId: z.string().trim().min(16).max(128).nullable().optional(),
  })
  .strict();
module.exports = {
  commentSchema,
  reportSchema,
  moderationSchema,
  analyticsIdentitySchema,
};
