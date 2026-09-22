const { z } = require("zod");
const pagination = {
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};
const reviewListSchema = z
  .object({
    ...pagination,
    sort: z.enum(["oldest", "newest"]).default("oldest"),
  })
  .strict();
const actionListSchema = z
  .object({
    ...pagination,
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    type: z.enum(["UNPUBLISH", "ARCHIVE"]).optional(),
    sort: z.enum(["oldest", "newest"]).default("oldest"),
  })
  .strict();
const reportListSchema = z
  .object({
    ...pagination,
    status: z.enum(["OPEN", "REJECTED", "RESOLVED"]).optional(),
    targetType: z.enum(["RESOURCE", "COMMENT"]).optional(),
    reason: z
      .enum(["OFFENSIVE", "MISINFORMATION", "SPAM", "INAPPROPRIATE", "OTHER"])
      .optional(),
    sort: z.enum(["oldest", "newest"]).default("oldest"),
  })
  .strict();
module.exports = { reviewListSchema, actionListSchema, reportListSchema };
