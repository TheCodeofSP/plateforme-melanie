const { z } = require("zod");
const objectId = z.string().regex(/^[a-f\d]{24}$/i);
const authorizeSchema = z.object({ applicationId: objectId, fileName: z.string().trim().min(1).max(255), mimeType: z.enum(["application/pdf", "image/jpeg", "image/png"]), size: z.number().int().positive().max(10 * 1024 ** 2) }).strict();
const confirmSchema = z.object({ documentId: objectId, publicId: z.string().min(1).max(500), version: z.number().int().positive(), signature: z.string().regex(/^[a-f\d]+$/i), format: z.string().min(1).max(30), resourceType: z.enum(["image", "raw"]), bytes: z.number().int().positive() }).strict();
const documentIdSchema = z.object({ documentId: objectId });
module.exports = { authorizeSchema, confirmSchema, documentIdSchema };
