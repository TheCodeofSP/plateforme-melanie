const { z } = require("zod");
const purposeLimits = {
  COVER: 5 * 1024 ** 2,
  PROFILE_PHOTO: 5 * 1024 ** 2,
  WEBINAR_IMAGE: 5 * 1024 ** 2,
  COMMUNICATION_IMAGE: 5 * 1024 ** 2,
  PDF: 50 * 1024 ** 2,
  AUDIO: 100 * 1024 ** 2,
  VIDEO: 100 * 1024 ** 2,
};
const mimeByPurpose = {
  COVER: ["image/jpeg", "image/png", "image/webp"],
  PROFILE_PHOTO: ["image/jpeg", "image/png", "image/webp"],
  WEBINAR_IMAGE: ["image/jpeg", "image/png", "image/webp"],
  COMMUNICATION_IMAGE: ["image/jpeg", "image/png", "image/webp"],
  PDF: ["application/pdf"],
  AUDIO: ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/wav", "audio/x-wav"],
  VIDEO: ["video/mp4", "video/webm", "video/quicktime"],
};
const uploadAuthorizationSchema = z
  .object({
    purpose: z.enum([
      "COVER",
      "PDF",
      "AUDIO",
      "VIDEO",
      "PROFILE_PHOTO",
      "WEBINAR_IMAGE",
      "COMMUNICATION_IMAGE",
    ]),
    fileName: z.string().trim().min(1).max(255),
    mimeType: z.string(),
    size: z.number().int().positive(),
    resourceId: z
      .string()
      .regex(/^[a-f\d]{24}$/i)
      .nullable()
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!mimeByPurpose[data.purpose].includes(data.mimeType))
      ctx.addIssue({
        code: "custom",
        path: ["mimeType"],
        message: "Format de fichier non autorisé.",
      });
    if (data.size > purposeLimits[data.purpose])
      ctx.addIssue({
        code: "custom",
        path: ["size"],
        message: "Le fichier dépasse la taille autorisée.",
      });
  });
const confirmMediaSchema = z
  .object({
    mediaId: z.string().regex(/^[a-f\d]{24}$/i),
    publicId: z.string().min(1).max(500),
    version: z.number().int().positive(),
    signature: z.string().regex(/^[a-f\d]+$/i),
    format: z.string().min(1).max(30),
    resourceType: z.enum(["image", "video", "raw"]),
    bytes: z.number().int().positive(),
  })
  .strict();
module.exports = {
  uploadAuthorizationSchema,
  confirmMediaSchema,
  purposeLimits,
  mimeByPurpose,
};
