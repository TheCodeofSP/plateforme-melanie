const test = require("node:test");
const assert = require("node:assert/strict");
const { getResourceIntroduction } = require("../src/utils/resource-preview.utils");
test("l’aperçu public ne conserve que le premier paragraphe, sans lien ni média privé", () => {
  const version = {
    description: "Résumé",
    blocks: [
      { type: "HEADING", text: "Titre" },
      { type: "PARAGRAPH", text: "Introduction", links: [{ url: "https://example.com/private" }] },
      { type: "PARAGRAPH", text: "Corps privé" },
      { type: "IMAGE", src: "https://example.com/private.png" },
    ],
  };
  assert.equal(getResourceIntroduction(version), "Introduction");
  assert.equal(getResourceIntroduction({ description: "Résumé" }), "Résumé");
  assert.equal(getResourceIntroduction({}), "");
});
