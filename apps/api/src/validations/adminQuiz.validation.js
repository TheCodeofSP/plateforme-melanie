const { z } = require("zod");
const objectId = z.string().regex(/^[a-f\d]{24}$/i);
const participantIdSchema = z.object({ participantId: objectId });
const attemptIdSchema = z.object({ attemptId: objectId });
const listSchema = z.object({
  q: z.string().trim().max(120).optional(),
  profile: z.enum(["BOULE_DE_NERFS", "CROQUE_TOUT", "DOUCE_MELANCOLIE", "GONFLEE_A_BLOC"]).optional(),
  accountType: z.enum(["MEMBER", "GUEST"]).optional(), status: z.enum(["COMPLETED", "INCOMPLETE"]).optional(),
  marketingConsent: z.enum(["true", "false"]).optional(), emailStatus: z.enum(["NOT_READY", "PENDING", "SENT", "FAILED"]).optional(), marketingSyncStatus: z.enum(["NOT_REQUESTED", "PENDING", "SYNCED", "FAILED"]).optional(),
  dateFrom: z.coerce.date().optional(), dateTo: z.coerce.date().optional(), sort: z.enum(["newest", "oldest", "name"]).default("newest"),
  page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();
const statsSchema = z.object({ dateFrom: z.coerce.date().optional(), dateTo: z.coerce.date().optional() }).strict();
module.exports = { participantIdSchema, attemptIdSchema, listSchema, statsSchema };
