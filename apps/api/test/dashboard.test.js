const test = require("node:test");
const assert = require("node:assert/strict");
const constants = require("../src/config/dashboard.constants");
const validation = require("../src/validations/dashboard.validation");

test("les huit statuts CRM validés sont stables", () => {
  assert.deepEqual(constants.CRM_STATUSES, [
    "NOUVEAU",
    "A_CONTACTER",
    "CONTACTE",
    "A_RELANCER",
    "INTERESSE",
    "NON_INTERESSE",
    "ACCOMPAGNE_CLIENT",
    "NE_PAS_CONTACTER",
  ]);
});
test("les six sources de contact sont fixes", () =>
  assert.equal(constants.CONTACT_SOURCES.length, 6));
test("un contact manuel est non consentant par défaut", () => {
  const value = validation.createContactSchema.parse({
    firstName: "Marie",
    email: "marie@example.com",
  });
  assert.equal(value.marketingConsent, undefined);
  assert.equal(value.source, "MANUAL");
});
test("un consentement positif exige sa date et sa source", () => {
  assert.equal(
    validation.createContactSchema.safeParse({
      firstName: "Marie",
      email: "marie@example.com",
      marketingConsent: { granted: true },
    }).success,
    false,
  );
});
test("une analyse croisée exige deux critères différents", () => {
  assert.equal(
    validation.crossAnalysisSchema.safeParse({
      primaryCriterion: "SPM_PROFILE",
      secondaryCriterion: "SPM_PROFILE",
    }).success,
    false,
  );
  assert.equal(
    validation.crossAnalysisSchema.safeParse({
      primaryCriterion: "CONTRACEPTION",
      secondaryCriterion: "SPM_PROFILE",
    }).success,
    true,
  );
});
test("les huit populations d’export sont disponibles", () =>
  assert.equal(constants.EXPORT_POPULATIONS.length, 8));
test("les notes privées exigent une confirmation d’export", () => {
  assert.equal(
    validation.exportSchema.safeParse({
      population: "CONTACTS",
      columns: ["privateNotes"],
      includePrivateNotes: true,
    }).success,
    false,
  );
});
test("un lien d’invitation accepte un jeton long", () => {
  assert.equal(
    validation.tokenSchema.safeParse({ token: "a".repeat(64) }).success,
    true,
  );
});
