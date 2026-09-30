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

const imports = require("../data/imports/articles.v3.json");
const { getRecetteKeys, getRecetteChanges } = require("../src/utils/resource-recette.utils");
const questions = require("../src/data/quizQuestions");

test("tous les imports V3 ont un accès et des profils conformes au catalogue Excel", () => {
  for (const item of imports) {
    const matches = config.filter((row) => getRecetteKeys(row).includes(item.externalImportKey));
    assert.equal(matches.length, 1, item.externalImportKey);
    const row = matches[0];
    assert.equal(item.visibility, row.visibility);
    assert.equal(item.content.proposedVisibility, row.visibility);
    assert.deepEqual(item.content.recommendedSpmProfiles, row.recommendedSpmProfiles);
  }
  const keys = config.flatMap(getRecetteKeys);
  assert.equal(new Set(keys).size, keys.length);
});

test("la mise à jour cible uniquement les accès et recommandations sans remplacer les contenus", () => {
  const row = config.find((row) => row.visibility === "MEMBERS_ONLY");
  const resource = {
    publishedVersion: { title: "Mon titre édité" },
    workingVersion: { title: "Mon brouillon" },
  };
  const original = structuredClone(resource);
  const changes = getRecetteChanges(resource, row);
  assert.deepEqual(
    Object.keys(changes).sort(),
    [
      "finalVisibility",
      "publishedVersion.proposedVisibility",
      "publishedVersion.recommendedSpmProfiles",
      "workingVersion.proposedVisibility",
      "workingVersion.recommendedSpmProfiles",
    ].sort(),
  );
  assert.equal(changes.finalVisibility, "MEMBERS_ONLY");
  assert.deepEqual(resource, original);
  assert.deepEqual(Object.keys(getRecetteChanges({ workingVersion: {} }, row)).sort(), [
    "workingVersion.proposedVisibility",
    "workingVersion.recommendedSpmProfiles",
  ]);
});

test("la première question classe les durées sans modifier les clés ni le score", () => {
  const first = questions.find((question) => question.id === "q1");
  assert.deepEqual(
    first.answers.map((answer) => answer.key),
    ["cycle_moins_21", "cycle_21_35", "cycle_plus_35", "cycle_irregulier"],
  );
  assert.deepEqual(
    first.answers.map((answer) => answer.profiles),
    [["DOUCE_MELANCOLIE"], [], ["GONFLEE_A_BLOC"], ["BOULE_DE_NERFS"]],
  );
});
