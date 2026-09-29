import layouts from "../../../content/article-layouts.json";

const VISUALISATION_TITLE = "La Visualisation : Un Outil Puissant Contre les Mycoses Vaginales";
const VISUALISATION_INTRO =
  "Les mycoses vaginales sont un problème récurrent pour de nombreuses personnes. Elles apparaissent souvent en période de stress, de fatigue ou après un traitement antibiotique, et peuvent devenir chroniques. Et si la clef pour en venir à bout durablement résidait aussi dans l’esprit ?";
const VISUALISATION_CONTINUATION =
  "La visualisation est une technique puissante qui permet d’agir sur le corps en mobilisant l’imaginaire et la conscience. De plus en plus d’études scientifiques confirment son impact sur la gestion du stress, la régulation du système immunitaire et même la diminution des douleurs chroniques. Explorons ensemble comment cet outil peut aider à soulager et prévenir les mycoses vaginales.";

/** Presentation compatibility for reviewed legacy imports.
 * No length-based guessing, no mutation and no database write.
 * New articles use HEADING level 2/3, BULLET_LIST and NUMBERED_LIST directly.
 */
export function prepareArticleBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  const valid = blocks.filter((block) => block && typeof block.type === "string");
  const anchor = valid.find((block) => block.type === "HEADING")?.text;
  const headings = valid.filter((block) => block.type === "HEADING");
  const layout = layouts.find(
    (item) =>
      item.anchor === anchor ||
      item.alternateAnchor?.every((text, index) => headings[index]?.text === text),
  );
  if (!layout) return valid;

  const result = [];
  for (let index = 0; index < valid.length; index += 1) {
    const block = valid[index];
    const list = layout.lists.find((candidate) =>
      candidate.texts.every(
        (text, offset) =>
          valid[index + offset]?.type === "PARAGRAPH" && valid[index + offset]?.text === text,
      ),
    );
    if (list) {
      result.push({
        type: list.type,
        items: valid.slice(index, index + list.texts.length).map((item) => ({
          text: item.text,
          links: item.links,
        })),
      });
      index += list.texts.length - 1;
      continue;
    }
    const heading = layout.headings.find((item) => item.text === block.text);
    if (heading && ["HEADING", "PARAGRAPH"].includes(block.type)) {
      result.push({ ...block, type: "HEADING", level: heading.level });
    } else if (block.type === "HEADING" && layout.paragraphs.includes(block.text)) {
      result.push({ ...block, type: "PARAGRAPH" });
    } else {
      result.push(block);
    }
  }
  if (layout.article === VISUALISATION_TITLE) {
    return result.filter(
      (block) =>
        !(
          (block.type === "HEADING" &&
            [VISUALISATION_TITLE, "Introduction"].includes(block.text)) ||
          (block.type === "PARAGRAPH" &&
            [VISUALISATION_INTRO, VISUALISATION_CONTINUATION].includes(block.text) &&
            !block.links?.length)
        ),
    );
  }
  return result;
}

export function getArticleLead(content) {
  const lead = content.description ? [content.description] : [];
  if (
    content.title === VISUALISATION_TITLE &&
    !content.description?.includes(VISUALISATION_CONTINUATION) &&
    content.blocks?.some(
      (block) =>
        block.type === "PARAGRAPH" &&
        block.text === VISUALISATION_CONTINUATION &&
        !block.links?.length,
    )
  ) {
    lead.push(VISUALISATION_CONTINUATION);
  }
  return lead;
}