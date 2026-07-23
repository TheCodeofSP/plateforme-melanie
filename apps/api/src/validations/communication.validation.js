const { z } = require("zod");
const {
  COMMUNICATION_TYPES,
  MARKETING_CATEGORIES,
  BLOCK_TYPES,
} = require("../config/communication.constants");
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Identifiant invalide.");
const plain = (min, max) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .refine((v) => !/<[^>]*>/.test(v), "Le HTML n’est pas autorisé.");
const safeHttps = z
  .url()
  .refine(
    (url) => url.startsWith("https://"),
    "Seuls les liens HTTPS sont autorisés.",
  )
  .refine(
    (url) => !/(bit\.ly|tinyurl\.com|t\.co|goo\.gl)/i.test(url),
    "Les liens raccourcis ne sont pas autorisés.",
  )
  .refine(
    (url) =>
      !/(paypal|stripe|checkout|payment|calendly|affiliate|affiliation|[?&](ref|aff|affiliate_id)=)/i.test(
        url,
      ),
    "Les liens de paiement, réservation ou affiliation ne sont pas autorisés.",
  );
const blockSchema = z
  .object({
    type: z.enum(BLOCK_TYPES),
    text: plain(0, 10000).optional(),
    level: z.number().int().min(1).max(3).optional(),
    items: z.array(plain(1, 1000)).max(30).optional(),
    label: plain(1, 180).optional(),
    url: safeHttps.optional(),
    image: objectId.nullable().optional(),
    altText: plain(1, 300).optional(),
    resource: objectId.nullable().optional(),
    webinar: objectId.nullable().optional(),
  })
  .strict();
const targetingSchema = z
  .object({
    roles: z
      .array(z.enum(["MEMBER", "INTERVENANT", "ADMIN"]))
      .max(3)
      .default([]),
    spmProfiles: z
      .array(
        z.enum([
          "NON_DEFINI",
          "BOULE_DE_NERFS",
          "CROQUE_TOUT",
          "DOUCE_MELANCOLIE",
          "GONFLEE_A_BLOC",
        ]),
      )
      .max(5)
      .default([]),
    includeQuizContacts: z.boolean().default(false),
    quizFrom: z.coerce.date().optional(),
    quizTo: z.coerce.date().optional(),
    webinar: objectId.nullable().optional(),
    webinarStatuses: z
      .array(
        z.enum(["REGISTERED", "WAITLISTED", "PRESENT", "ABSENT", "CANCELLED"]),
      )
      .max(5)
      .default([]),
    manualUsers: z.array(objectId).max(500).default([]),
    manualQuizParticipants: z.array(objectId).max(500).default([]),
    manualCrmContacts: z.array(objectId).max(500).default([]),
  })
  .strict();
const createSchema = z
  .object({
    internalTitle: plain(3, 180),
    type: z.enum(COMMUNICATION_TYPES),
    channel: z.enum(["EMAIL", "IN_APP"]),
    subject: plain(1, 180).nullable().optional(),
    preheader: plain(0, 250).nullable().optional(),
    notificationTitle: plain(1, 180).nullable().optional(),
    notificationMessage: plain(1, 1000).nullable().optional(),
    notificationPath: z
      .string()
      .trim()
      .regex(/^\/[a-zA-Z0-9/_?=&.-]*$/, "Route interne invalide.")
      .nullable()
      .optional(),
    blocks: z.array(blockSchema).max(100).default([]),
    mainImage: objectId.nullable().optional(),
    senderName: plain(1, 120).default("Mélanie"),
    replyTo: z.email().nullable().optional(),
    preferenceCategory: z.enum(MARKETING_CATEGORIES).nullable().optional(),
    administrativeReason: plain(5, 2000).nullable().optional(),
    targeting: targetingSchema.default({}),
    timezone: z.string().trim().min(1).max(80).default("Europe/Paris"),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.channel === "EMAIL" && (!data.subject || !data.blocks.length))
      ctx.addIssue({
        code: "custom",
        message: "Un email exige un objet et du contenu.",
      });
    if (
      data.channel === "IN_APP" &&
      (!data.notificationTitle || !data.notificationMessage)
    )
      ctx.addIssue({
        code: "custom",
        message: "La notification exige un titre et un message.",
      });
    if (data.type === "ADMINISTRATIVE" && !data.administrativeReason)
      ctx.addIssue({
        code: "custom",
        path: ["administrativeReason"],
        message: "La justification administrative est obligatoire.",
      });
    if (data.type !== "ADMINISTRATIVE" && !data.preferenceCategory)
      ctx.addIssue({
        code: "custom",
        path: ["preferenceCategory"],
        message: "La catégorie de consentement est obligatoire.",
      });
    const buttons = data.blocks.filter((b) => b.type === "BUTTON");
    if (buttons.length > 5)
      ctx.addIssue({ code: "custom", message: "Cinq boutons maximum." });
    for (const block of data.blocks) {
      if (["BUTTON"].includes(block.type) && (!block.label || !block.url))
        ctx.addIssue({
          code: "custom",
          message: "Un bouton exige un libellé et une URL.",
        });
      if (block.type === "IMAGE" && (!block.image || !block.altText))
        ctx.addIssue({
          code: "custom",
          message: "Une image exige un média et un texte alternatif.",
        });
      if (block.type === "RESOURCE" && !block.resource)
        ctx.addIssue({
          code: "custom",
          message: "La ressource est obligatoire.",
        });
      if (block.type === "WEBINAR" && !block.webinar)
        ctx.addIssue({
          code: "custom",
          message: "Le webinaire est obligatoire.",
        });
    }
  });
const updateSchema = z
  .object({
    internalTitle: plain(3, 180).optional(),
    type: z.enum(COMMUNICATION_TYPES).optional(),
    channel: z.enum(["EMAIL", "IN_APP"]).optional(),
    subject: plain(1, 180).nullable().optional(),
    preheader: plain(0, 250).nullable().optional(),
    notificationTitle: plain(1, 180).nullable().optional(),
    notificationMessage: plain(1, 1000).nullable().optional(),
    notificationPath: z
      .string()
      .trim()
      .regex(/^\/[a-zA-Z0-9/_?=&.-]*$/)
      .nullable()
      .optional(),
    blocks: z.array(blockSchema).max(100).optional(),
    mainImage: objectId.nullable().optional(),
    senderName: plain(1, 120).optional(),
    replyTo: z.email().nullable().optional(),
    preferenceCategory: z.enum(MARKETING_CATEGORIES).nullable().optional(),
    administrativeReason: plain(5, 2000).nullable().optional(),
    targeting: targetingSchema.optional(),
    timezone: z.string().trim().min(1).max(80).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length, "Aucune modification fournie.");
const idSchema = z.object({ communicationId: objectId });
const recipientIdSchema = z.object({ recipientId: objectId });
const listSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z
      .enum(["DRAFT", "SCHEDULED", "SENDING", "SENT", "CANCELLED", "FAILED"])
      .optional(),
    channel: z.enum(["EMAIL", "IN_APP"]).optional(),
    type: z.enum(COMMUNICATION_TYPES).optional(),
    q: z.string().trim().max(100).optional(),
  })
  .strict();
const scheduleSchema = z
  .object({
    scheduledFor: z.coerce.date(),
    timezone: z.string().trim().min(1).max(80).default("Europe/Paris"),
  })
  .strict();
const testSchema = z.object({ email: z.email().optional() }).strict();
const unsubscribeSchema = z
  .object({
    token: z.string().min(32).max(500),
    categories: z.array(z.enum(MARKETING_CATEGORIES)).min(1).max(4).optional(),
    all: z.boolean().optional(),
  })
  .strict();
const tokenSchema = z.object({ token: z.string().min(32).max(500) }).strict();
const preferencesSchema = z
  .object({
    editorialNewsletter: z.boolean().optional(),
    resourceAnnouncements: z.boolean().optional(),
    webinarAnnouncements: z.boolean().optional(),
    platformNews: z.boolean().optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length, "Aucune préférence fournie.");
const resubscribeSchema = z
  .object({ email: z.email(), preferences: preferencesSchema })
  .strict();
const suppressionLiftSchema = z.object({ reason: plain(5, 1000) }).strict();
module.exports = {
  createSchema,
  updateSchema,
  idSchema,
  recipientIdSchema,
  listSchema,
  scheduleSchema,
  testSchema,
  unsubscribeSchema,
  tokenSchema,
  preferencesSchema,
  resubscribeSchema,
  suppressionLiftSchema,
  targetingSchema,
  blockSchema,
};
