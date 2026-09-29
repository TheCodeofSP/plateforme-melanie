const test = require("node:test");
const assert = require("node:assert/strict");
const rows = require("../src/data/editorialResources.seed");
const config = require("../src/data/resourceRecette.config.json");
const { completeResourceVersionSchema } = require("../src/validations/resource.validation");
const { SPM_PROFILES } = require("../src/config/quiz.constants");

test("le catalogue de recette valide 18 ressources membres et 9 publiques", () => {
  assert.equal(rows.length, 27);
  assert.equal(rows.filter((row) => row.content.proposedVisibility === "MEMBERS_ONLY").length, 18);
  for (const row of rows) {
    assert.ok(completeResourceVersionSchema.safeParse(row.content).success, row.externalImportKey);
    const settings = config.find((item) => item.externalImportKey === row.externalImportKey);
    assert.equal(settings.visibility, row.content.proposedVisibility);
    assert.deepEqual(settings.recommendedSpmProfiles, row.content.recommendedSpmProfiles);
  }
});

test("chaque profil dispose de trois articles recommandés pour la recette", () => {
  for (const profile of SPM_PROFILES.filter((value) => value !== "NON_DEFINI")) {
    const recommendations = rows.filter((row) =>
      row.content.recommendedSpmProfiles.includes(profile),
    );
    assert.equal(recommendations.length, 3, profile);
    assert.ok(recommendations.every((row) => row.content.format === "ARTICLE"));
  }
});
