const test = require("node:test");
const assert = require("node:assert/strict");
const { completeResourceVersionSchema, updateResourceSchema } = require("../src/validations/resource.validation");
const { uploadAuthorizationSchema } = require("../src/validations/media.validation");

const base = { title: "Ressource", description: "Description", categories: ["SPM"], recommendedSpmProfiles: [], keywords: [], durationMinutes: 5, proposedVisibility: "PUBLIC" };

test("un brouillon incomplet reste enregistrable", () => {
  assert.equal(updateResourceSchema.safeParse({ title: "Début" }).success, true);
});

test("un article complet est soumis", () => {
  const result = completeResourceVersionSchema.safeParse({ ...base, format: "ARTICLE", sourceMode: "TEXT", blocks: [{ type: "PARAGRAPH", text: "Contenu" }] });
  assert.equal(result.success, true);
});

test("un ebook exige un PDF", () => {
  const result = completeResourceVersionSchema.safeParse({ ...base, format: "EBOOK", sourceMode: "HOSTED" });
  assert.equal(result.success, false);
});

test("une newsletter accepte texte, PDF ou lien", () => {
  const result = completeResourceVersionSchema.safeParse({ ...base, format: "NEWSLETTER", sourceMode: "EXTERNAL", externalUrl: "https://example.com/newsletter" });
  assert.equal(result.success, true);
});

test("deux profils SPM maximum", () => {
  const result = completeResourceVersionSchema.safeParse({ ...base, format: "ARTICLE", sourceMode: "TEXT", blocks: [{ type: "PARAGRAPH", text: "Contenu" }], recommendedSpmProfiles: ["DOUCE_MELANCOLIE", "GONFLEE_A_BLOC", "CROQUE_TOUT"] });
  assert.equal(result.success, false);
});

test("une couverture exige un texte alternatif", () => {
  const result = completeResourceVersionSchema.safeParse({ ...base, format: "ARTICLE", sourceMode: "TEXT", blocks: [{ type: "PARAGRAPH", text: "Contenu" }], coverMedia: "507f1f77bcf86cd799439011" });
  assert.equal(result.success, false);
});

test("les limites de média sont appliquées", () => {
  assert.equal(uploadAuthorizationSchema.safeParse({ purpose: "COVER", fileName: "image.jpg", mimeType: "image/jpeg", size: 5 * 1024 ** 2 }).success, true);
  assert.equal(uploadAuthorizationSchema.safeParse({ purpose: "COVER", fileName: "image.jpg", mimeType: "image/jpeg", size: 6 * 1024 ** 2 }).success, false);
});
