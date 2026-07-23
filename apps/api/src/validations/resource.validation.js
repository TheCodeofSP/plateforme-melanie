const { z } = require("zod");
const {
  RESOURCE_FORMATS,
  RESOURCE_CATEGORIES,
  SPM_PROFILES,
  RESOURCE_VISIBILITIES,
} = require("../config/resource.constants");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Identifiant invalide.");
const nullableUrl = z
  .union([z.url("URL invalide."), z.literal(""), z.null()])
  .optional();
const blockSchema = z
  .object({
    type: z.enum([
      "PARAGRAPH",
      "HEADING",
      "BULLET_LIST",
      "NUMBERED_LIST",
      "QUOTE",
    ]),
    text: z.string().trim().max(10000).optional(),
    items: z.array(z.string().trim().min(1).max(1000)).max(100).optional(),
    links: z
      .array(
        z.object({
          label: z.string().trim().min(1).max(200),
          url: z.url("URL invalide."),
        }),
      )
      .max(20)
      .optional(),
  })
  .superRefine((block, ctx) => {
    const isList = ["BULLET_LIST", "NUMBERED_LIST"].includes(block.type);
    if (isList && !block.items?.length)
      ctx.addIssue({
        code: "custom",
        path: ["items"],
        message: "La liste doit contenir au moins un élément.",
      });
    if (!isList && !block.text)
      ctx.addIssue({
        code: "custom",
        path: ["text"],
        message: "Le texte est obligatoire.",
      });
  });

const resourceVersionSchema = z
  .object({
    title: z.string().trim().max(180).optional(),
    description: z.string().trim().max(1000).optional(),
    format: z.enum(RESOURCE_FORMATS).optional(),
    categories: z
      .array(z.enum(RESOURCE_CATEGORIES))
      .max(14)
      .refine(
        (items) => new Set(items).size === items.length,
        "Une catégorie ne peut apparaître qu’une fois.",
      )
      .optional(),
    recommendedSpmProfiles: z
      .array(z.enum(SPM_PROFILES))
      .max(2, "Deux profils SPM maximum.")
      .refine(
        (items) => new Set(items).size === items.length,
        "Un profil SPM ne peut apparaître qu’une fois.",
      )
      .optional(),
    keywords: z
      .array(z.string().trim().min(1).max(60))
      .max(10, "Dix mots-clés maximum.")
      .refine(
        (items) =>
          new Set(items.map((item) => item.toLowerCase())).size ===
          items.length,
        "Un mot-clé ne peut apparaître qu’une fois.",
      )
      .optional(),
    durationMinutes: z.number().int().min(1).max(10000).optional(),
    proposedVisibility: z.enum(RESOURCE_VISIBILITIES).optional(),
    coverMedia: objectId.nullable().optional(),
    coverAlt: z.string().trim().max(300).nullable().optional(),
    coverCredit: z.string().trim().max(200).nullable().optional(),
    coverCaption: z.string().trim().max(300).nullable().optional(),
    blocks: z.array(blockSchema).max(500).optional(),
    sourceMode: z.enum(["HOSTED", "EXTERNAL", "MIXED", "TEXT"]).optional(),
    media: objectId.nullable().optional(),
    pdf: objectId.nullable().optional(),
    externalUrl: nullableUrl,
    externalPlatform: z.string().trim().max(80).nullable().optional(),
    showName: z.string().trim().max(160).nullable().optional(),
    episodeNumber: z.number().int().min(1).nullable().optional(),
  })
  .strict();

const createResourceSchema = z
  .object({ workingVersion: resourceVersionSchema.optional() })
  .strict();
const updateResourceSchema = resourceVersionSchema;

const completeResourceVersionSchema = resourceVersionSchema.superRefine(
  (data, ctx) => {
    for (const field of ["title", "description", "format", "durationMinutes"]) {
      if (data[field] === undefined || data[field] === "")
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: "Ce champ est obligatoire.",
        });
    }
    if (!data.categories?.length)
      ctx.addIssue({
        code: "custom",
        path: ["categories"],
        message: "Choisis au moins une catégorie.",
      });
    if (!data.sourceMode)
      ctx.addIssue({
        code: "custom",
        path: ["sourceMode"],
        message: "Le mode de diffusion est obligatoire.",
      });
    if (data.format === "ARTICLE" && !data.blocks?.length) {
      ctx.addIssue({
        code: "custom",
        path: ["blocks"],
        message: "Le contenu textuel est obligatoire.",
      });
    }
    if (["EBOOK", "TOOL"].includes(data.format) && !data.pdf)
      ctx.addIssue({
        code: "custom",
        path: ["pdf"],
        message: "Un fichier PDF est obligatoire.",
      });
    if (
      ["PODCAST", "AUDIO", "VIDEO"].includes(data.format) &&
      !data.media &&
      !data.externalUrl
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["media"],
        message: "Un fichier ou un lien externe est obligatoire.",
      });
    }
    if (data.format === "PODCAST" && !data.showName)
      ctx.addIssue({
        code: "custom",
        path: ["showName"],
        message: "Le nom de l’émission est obligatoire.",
      });
    if (
      data.format === "NEWSLETTER" &&
      !data.blocks?.length &&
      !data.pdf &&
      !data.externalUrl
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["blocks"],
        message: "Ajoute du texte, un PDF ou un lien.",
      });
    }
    if (data.coverMedia && !data.coverAlt)
      ctx.addIssue({
        code: "custom",
        path: ["coverAlt"],
        message: "Le texte alternatif de l’image est obligatoire.",
      });
  },
);

const reviewDecisionSchema = z
  .object({
    visibility: z.enum(RESOURCE_VISIBILITIES).optional(),
    scheduledFor: z.iso.datetime().nullable().optional(),
    comment: z.string().trim().max(2000).nullable().optional(),
  })
  .strict();
const requestChangesSchema = z
  .object({ comment: z.string().trim().min(5).max(2000) })
  .strict();
const actionRequestSchema = z
  .object({
    type: z.enum(["UNPUBLISH", "ARCHIVE"]),
    reason: z.string().trim().min(5).max(2000),
  })
  .strict();
const actionDecisionSchema = z
  .object({ comment: z.string().trim().max(2000).nullable().optional() })
  .strict();
const visibilitySettingsSchema = z
  .object({
    visibility: z.enum(RESOURCE_VISIBILITIES),
    comment: z.string().trim().max(2000).nullable().optional(),
  })
  .strict();

module.exports = {
  objectId,
  createResourceSchema,
  updateResourceSchema,
  completeResourceVersionSchema,
  reviewDecisionSchema,
  requestChangesSchema,
  actionRequestSchema,
  actionDecisionSchema,
  visibilitySettingsSchema,
};
