const test = require("node:test");
const assert = require("node:assert/strict");
const { publicProjection } = require("../src/services/resources/resource.service");

test("une ressource verrouillée conserve durée et date mais jamais les blocs privés", () => {
  const resource = {
    finalVisibility: "MEMBERS_ONLY",
    lastPublishedAt: "2026-09-29T12:00:00Z",
    publishedVersion: {
      title: "Article",
      format: "ARTICLE",
      durationMinutes: 6,
      description: "Résumé",
      blocks: [
        { type: "PARAGRAPH", text: "Introduction" },
        { type: "PARAGRAPH", text: "Corps privé" },
      ],
      externalUrl: "https://example.org/private",
    },
  };
  const result = publicProjection(resource, null);
  assert.equal(result.locked, true);
  assert.equal(result.content.durationMinutes, 6);
  assert.equal(result.publishedAt, resource.lastPublishedAt);
  assert.equal(result.content.blocks, undefined);
  assert.equal(result.content.externalUrl, undefined);
  assert.ok(!JSON.stringify(result).includes("Corps privé"));
  assert.deepEqual(
    publicProjection(resource, { _id: "member" }).content.blocks,
    resource.publishedVersion.blocks,
  );
});
