const { z } = require("zod");

const checksSchema = z.object({
  services: z.array(z.enum(["RESEND", "CLOUDINARY"])).min(1).max(2),
}).strict();

const emailDispatchListSchema = z.object({
  type: z.string().trim().max(80).optional(),
  status: z.enum(["SENT", "FAILED"]).optional(),
  recipient: z.email().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

module.exports = { checksSchema, emailDispatchListSchema };
