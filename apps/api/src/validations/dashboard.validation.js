const { z } = require("zod");
const {
  CRM_STATUSES,
  CONTACT_SOURCES,
  TASK_PRIORITIES,
  TASK_RESULTS,
  SEGMENT_MODES,
  EXPORT_POPULATIONS,
} = require("../config/dashboard.constants");
const objectId = z.string().regex(/^[a-f\d]{24}$/i);
const idSchema = z.object({ id: objectId });
const contactIdSchema = z.object({ contactId: objectId });
const itemIdSchema = z.object({ itemId: objectId });
const tokenSchema = z.object({ token: z.string().min(32).max(300) });
const pagination = {
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
};
const dateRange = {
  dateFrom: z.iso.datetime().optional(),
  dateTo: z.iso.datetime().optional(),
};
const contactListSchema = z
  .object({
    ...pagination,
    ...dateRange,
    q: z.string().trim().max(120).optional(),
    kind: z.enum(["ALL", "MEMBER", "PROSPECT", "MANUAL"]).default("ALL"),
    status: z.enum(CRM_STATUSES).optional(),
    spmProfile: z.string().max(50).optional(),
    contraception: z.string().max(100).optional(),
    priority: z.enum(TASK_PRIORITIES).optional(),
    tag: objectId.optional(),
    inactiveDays: z.coerce.number().int().min(1).max(3650).optional(),
    sort: z
      .enum(["NEWEST", "OLDEST", "LAST_ACTIVITY", "PRIORITY"])
      .default("NEWEST"),
  })
  .strict();
const createContactSchema = z
  .object({
    firstName: z.string().trim().min(2).max(80),
    lastName: z.string().trim().max(80).nullable().optional(),
    email: z.email(),
    phone: z.string().trim().max(40).nullable().optional(),
    source: z.enum(CONTACT_SOURCES).default("MANUAL"),
    sourceDetail: z.string().trim().max(200).nullable().optional(),
    status: z.enum(CRM_STATUSES).default("NOUVEAU"),
    priority: z.enum(TASK_PRIORITIES).default("NORMAL"),
    tagIds: z.array(objectId).max(50).default([]),
    marketingConsent: z
      .object({
        granted: z.boolean(),
        occurredAt: z.iso.datetime().nullable().optional(),
        source: z.string().trim().max(200).nullable().optional(),
      })
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      data.marketingConsent?.granted &&
      (!data.marketingConsent.occurredAt || !data.marketingConsent.source)
    )
      ctx.addIssue({
        code: "custom",
        path: ["marketingConsent"],
        message: "La date et la source du consentement sont obligatoires.",
      });
  });
const updateContactSchema = z
  .object({
    firstName: z.string().trim().min(2).max(80).optional(),
    lastName: z.string().trim().max(80).nullable().optional(),
    phone: z.string().trim().max(40).nullable().optional(),
    status: z.enum(CRM_STATUSES).optional(),
    priority: z.enum(TASK_PRIORITIES).optional(),
    tagIds: z.array(objectId).max(50).optional(),
    marketingConsent: z
      .object({
        granted: z.boolean(),
        occurredAt: z.iso.datetime().nullable().optional(),
        source: z.string().trim().max(200).nullable().optional(),
      })
      .optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length);
const noteSchema = z
  .object({
    text: z.string().trim().min(1).max(5000),
    pinned: z.boolean().default(false),
  })
  .strict();
const noteUpdateSchema = noteSchema
  .partial()
  .strict()
  .refine((v) => Object.keys(v).length);
const tagSchema = z
  .object({
    name: z.string().trim().min(1).max(60),
    color: z.string().regex(/^#[0-9a-f]{6}$/i),
  })
  .strict();
const taskSchema = z
  .object({
    title: z.string().trim().min(1).max(180),
    dueAt: z.iso.datetime(),
    priority: z.enum(TASK_PRIORITIES).default("NORMAL"),
    note: z.string().trim().max(2000).nullable().optional(),
  })
  .strict();
const taskUpdateSchema = taskSchema
  .partial()
  .strict()
  .refine((v) => Object.keys(v).length);
const completeTaskSchema = z
  .object({
    result: z.enum(TASK_RESULTS),
    resultNote: z.string().trim().max(2000).nullable().optional(),
  })
  .strict();
const snoozeSchema = z.object({ dueAt: z.iso.datetime() }).strict();
const mergeSchema = z
  .object({
    primaryContactId: objectId,
    mergedContactId: objectId,
    values: z
      .object({
        firstName: z.string().trim().min(2).max(80).optional(),
        lastName: z.string().trim().max(80).nullable().optional(),
        primaryEmail: z.email().optional(),
        phone: z.string().trim().max(40).nullable().optional(),
        status: z.enum(CRM_STATUSES).optional(),
        marketingConsent: z
          .object({
            granted: z.boolean(),
            occurredAt: z.iso.datetime().nullable().optional(),
            source: z.string().max(200).nullable().optional(),
          })
          .optional(),
      })
      .default({}),
  })
  .strict()
  .refine((v) => v.primaryContactId !== v.mergedContactId);
const invitationSendSchema = z
  .object({ sendEmail: z.boolean().default(true) })
  .strict();
const overviewSchema = z.object({ ...dateRange }).strict();
const crossAnalysisSchema = z
  .object({
    primaryCriterion: z.enum([
      "SPM_PROFILE",
      "CONTRACEPTION",
      "AGE_RANGE",
      "QUIZ_CATEGORY",
      "CONTACT_KIND",
      "WEBINAR_PARTICIPATION",
    ]),
    secondaryCriterion: z.enum([
      "SPM_PROFILE",
      "CONTRACEPTION",
      "AGE_RANGE",
      "QUIZ_CATEGORY",
      "CONTACT_KIND",
      "WEBINAR_PARTICIPATION",
    ]),
    filters: z.record(z.string(), z.unknown()).default({}),
    groups: z
      .array(
        z.object({
          name: z.string().min(1).max(80),
          values: z.array(z.string()).min(1),
        }),
      )
      .max(20)
      .default([]),
    includeAnonymized: z.boolean().default(false),
  })
  .strict()
  .refine((v) => v.primaryCriterion !== v.secondaryCriterion);
const savedItemSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    mode: z.enum(SEGMENT_MODES).nullable().optional(),
    area: z.string().trim().max(80).nullable().optional(),
    criteria: z.record(z.string(), z.unknown()).default({}),
    contactIds: z.array(objectId).max(10000).default([]),
  })
  .strict();
const exportSchema = z
  .object({
    population: z.enum(EXPORT_POPULATIONS),
    filters: z.record(z.string(), z.unknown()).default({}),
    columns: z.array(z.string().min(1).max(80)).min(1).max(50),
    includePrivateNotes: z.boolean().default(false),
    privateNotesWarningAccepted: z.boolean().default(false),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.includePrivateNotes && !v.privateNotesWarningAccepted)
      ctx.addIssue({
        code: "custom",
        path: ["privateNotesWarningAccepted"],
        message: "L’avertissement doit être accepté.",
      });
  });
module.exports = {
  objectId,
  idSchema,
  contactIdSchema,
  itemIdSchema,
  tokenSchema,
  contactListSchema,
  createContactSchema,
  updateContactSchema,
  noteSchema,
  noteUpdateSchema,
  tagSchema,
  taskSchema,
  taskUpdateSchema,
  completeTaskSchema,
  snoozeSchema,
  mergeSchema,
  invitationSendSchema,
  overviewSchema,
  crossAnalysisSchema,
  savedItemSchema,
  exportSchema,
};
