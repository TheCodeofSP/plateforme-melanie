const test = require("node:test");
const assert = require("node:assert/strict");
const {
  databaseName,
  assertAutomatedTestDatabase,
  assertStagingDatabase,
} = require("../src/utils/databaseSafety");
const systemValidation = require("../src/validations/system.validation");
const { cleanError, RETENTION_MS } = require("../src/services/emailDispatchLog.service");

test("les garde-fous distinguent les bases automatisée et staging", () => {
  const testUri = "mongodb+srv://user:pass@example.mongodb.net/plateforme_melanie_automated_test";
  const stagingUri = "mongodb+srv://user:pass@example.mongodb.net/plateforme_melanie_staging";
  assert.equal(databaseName(testUri), "plateforme_melanie_automated_test");
  assert.equal(assertAutomatedTestDatabase({
    testUri,
    mainUri: stagingUri,
    allowReset: true,
  }), "plateforme_melanie_automated_test");
  assert.equal(assertStagingDatabase({ uri: stagingUri }), "plateforme_melanie_staging");
});

test("un reset refuse une base principale ou une confirmation absente", () => {
  assert.throws(() => assertAutomatedTestDatabase({
    testUri: "mongodb://localhost/plateforme_melanie",
    mainUri: "mongodb://localhost/plateforme_melanie",
    allowReset: true,
  }));
  assert.throws(() => assertStagingDatabase({
    uri: "mongodb://localhost/plateforme_melanie_staging",
    allowReset: true,
    confirmation: "NON",
    reset: true,
  }));
});

test("les contrôles externes acceptent uniquement Resend et Cloudinary", () => {
  assert.equal(systemValidation.checksSchema.safeParse({
    services: ["RESEND", "CLOUDINARY"],
  }).success, true);
  assert.equal(systemValidation.checksSchema.safeParse({
    services: ["MONGODB"],
  }).success, false);
});

test("les journaux email masquent les secrets et expirent après trente jours", () => {
  assert.equal(RETENTION_MS, 30 * 24 * 60 * 60 * 1000);
  assert.doesNotMatch(
    cleanError(new Error("token=secret-value password=hunter2")),
    /secret-value|hunter2/,
  );
});
