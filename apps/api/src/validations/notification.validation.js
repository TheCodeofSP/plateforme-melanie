const { z } = require("zod");
const {
  NOTIFICATION_NATURES,
  NOTIFICATION_CATEGORIES,
  PREFERENCE_CATEGORIES,
} = require("../config/notification.constants");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Identifiant invalide.");
const notificationIdSchema = z.object({ notificationId: objectId }).strict();
const listSchema = z
  .object({
    nature: z.enum(NOTIFICATION_NATURES).optional(),
    category: z.enum(NOTIFICATION_CATEGORIES).optional(),
    status: z.enum(["READ", "UNREAD"]).optional(),
    sort: z.enum(["NEWEST", "OLDEST"]).default("NEWEST"),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    cursor: z.iso.datetime().optional(),
  })
  .strict();

const bulkSchema = listSchema
  .omit({ limit: true, cursor: true, sort: true })
  .optional()
  .default({});

const channelPreference = z
  .object({ platform: z.boolean().optional(), email: z.boolean().optional() })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Aucun canal fourni.");

const preferenceSchema = z
  .object({
    categories: z
      .partialRecord(z.enum(PREFERENCE_CATEGORIES), channelPreference)
      .refine(
        (value) => Object.keys(value).length > 0,
        "Aucune préférence fournie.",
      ),
  })
  .strict();

const testSchema = z
  .object({
    title: z.string().trim().min(1).max(180),
    message: z.string().trim().min(1).max(1000),
    category: z.enum(PREFERENCE_CATEGORIES).default("ACCOUNT_SECURITY"),
    channels: z
      .array(z.enum(["PLATFORM", "EMAIL"]))
      .min(1)
      .max(2)
      .refine(
        (items) => new Set(items).size === items.length,
        "Canal dupliqué.",
      ),
    actionPath: z
      .string()
      .trim()
      .regex(/^\/[a-zA-Z0-9/_?=&.-]*$/, "Chemin interne invalide.")
      .default("/"),
  })
  .strict();

const previewSchema = testSchema.omit({ channels: true, category: true });

module.exports = {
  notificationIdSchema,
  listSchema,
  bulkSchema,
  preferenceSchema,
  testSchema,
  previewSchema,
};
