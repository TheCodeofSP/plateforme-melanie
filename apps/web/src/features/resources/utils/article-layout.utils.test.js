import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import { getArticleLead, prepareArticleBlocks } from "./article-layout.utils.js";
const require = createRequire(import.meta.url);
const resources = require("../../../../../api/src/data/editorialResources.seed.js");
const imports = require("../../../../../api/data/imports/articles.v3.json");
const articles = resources.filter((row) => row.content.format === "ARTICLE");
function texts(blocks) {
  return blocks.flatMap((block) =>
    block.items
      ? block.items.flatMap((item) =>
          typeof item === "string"
            ? [item]
            : [item.text, ...(item.links || []).map((link) => JSON.stringify(link))],
        )
      : [block.text, ...(block.links || []).map((link) => JSON.stringify(link))].filter(Boolean),
  );
}
describe("article layout compatibility", () => {
  it.each([...articles, ...imports])(
    "preserves every word, link and order: $content.title",
    ({ content }) => {
      const original = structuredClone(content.blocks);
      const result = prepareArticleBlocks(content.blocks);
      const expected =
        content.title === "La Visualisation : Un Outil Puissant Contre les Mycoses Vaginales"
          ? original.filter(
              (block) =>
                !(
                  block.type === "HEADING" && [content.title, "Introduction"].includes(block.text)
                ) &&
                !(
                  block.type === "PARAGRAPH" &&
                  [
                    "Les mycoses vaginales sont un problème récurrent pour de nombreuses personnes. Elles apparaissent souvent en période de stress, de fatigue ou après un traitement antibiotique, et peuvent devenir chroniques. Et si la clef pour en venir à bout durablement résidait aussi dans l’esprit ?",
                    "La visualisation est une technique puissante qui permet d’agir sur le corps en mobilisant l’imaginaire et la conscience. De plus en plus d’études scientifiques confirment son impact sur la gestion du stress, la régulation du système immunitaire et même la diminution des douleurs chroniques. Explorons ensemble comment cet outil peut aider à soulager et prévenir les mycoses vaginales.",
                  ].includes(block.text)
                ),
            )
          : original;
      expect(texts(result)).toEqual(texts(expected));
      expect(content.blocks).toEqual(original);
      expect(prepareArticleBlocks(result)).toEqual(result);
    },
  );
  it("keeps the reference article unchanged", () => {
    const reference = articles.find((row) =>
      row.externalImportKey.endsWith("-gerer-sa-fertilite-en-autonomie"),
    );
    expect(prepareArticleBlocks(reference.content.blocks)).toEqual(reference.content.blocks);
  });
  it("does not guess structure for new articles or changed list items", () => {
    const unknown = [
      { type: "HEADING", level: 3, text: "Un titre inédit" },
      { type: "PARAGRAPH", text: "Une phrase courte" },
    ];
    expect(prepareArticleBlocks(unknown)).toEqual(unknown);
    const source = articles.find((row) =>
      row.externalImportKey.endsWith("-douleurs-des-seins-tout-ce-quil-faut-savoir"),
    );
    const blocks = structuredClone(source.content.blocks);
    blocks[22].text = "Un contenu modifié";
    expect(prepareArticleBlocks(blocks).some((block) => block.type === "BULLET_LIST")).toBe(false);
  });
  it("restores reviewed subheadings and real lists", () => {
    const source = articles.find((row) => row.externalImportKey.endsWith("-musique-et-emotions"));
    const result = prepareArticleBlocks(source.content.blocks);
    expect(result.find((block) => block.text === "Créer une playlist cyclique")).toMatchObject({
      type: "HEADING",
      level: 3,
    });
    expect(result.some((block) => block.type === "NUMBERED_LIST")).toBe(true);
  });
});

it("prend aussi en charge les variantes de l’import V3", () => {
  for (const suffix of [
    "la-visualisation-un-outil-puissant-contre-les-mycoses-vaginales",
    "quand-la-douleur-devient-une-zone-de-confort",
  ]) {
    const row = imports.find((item) => item.externalImportKey.endsWith(suffix));
    expect(
      prepareArticleBlocks(row.content.blocks).some((block) =>
        ["BULLET_LIST", "NUMBERED_LIST"].includes(block.type),
      ),
    ).toBe(true);
  }
});

it("retire uniquement le doublon d’introduction et garde la suite et le chapeau", () => {
  const article = articles.find((row) => row.externalImportKey.includes("visualisation-un-outil"));
  const before = structuredClone(article.content);
  const result = prepareArticleBlocks(article.content.blocks);
  expect(result.some((block) => block.type === "HEADING" && block.text === "Introduction")).toBe(
    false,
  );
  expect(result.some((block) => block.text === article.content.description)).toBe(false);
  expect(result.some((block) => block.text === article.content.blocks[3].text)).toBe(false);
  expect(getArticleLead(article.content)).toEqual([
    article.content.description,
    article.content.blocks[3].text,
  ]);
  expect(result[0].text).toBe("Qu’est-ce que la Visualisation et Comment Fonctionne-t-elle ?");
  expect(getArticleLead({ ...article.content, blocks: [] })).toEqual([article.content.description]);
  expect(article.content).toEqual(before);
  const edited = structuredClone(article.content.blocks);
  edited[2].text = "Une nouvelle introduction éditée.";
  expect(prepareArticleBlocks(edited).some((block) => block.text === edited[2].text)).toBe(true);
});
