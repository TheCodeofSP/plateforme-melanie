// Only the opening paragraph is public. Never send the remaining private body
// to a guest, even if the interface visually blurs its placeholder.
function getResourceIntroduction(version = {}) {
  const first = (version.blocks || []).find(
    (block) => block?.type === "PARAGRAPH" && typeof block.text === "string",
  );
  return first?.text || version.description || "";
}
module.exports = { getResourceIntroduction };
