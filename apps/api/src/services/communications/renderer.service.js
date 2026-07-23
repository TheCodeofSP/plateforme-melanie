const escapeHtml = require("../../templates/auth/escapeHtml");
const env = require("../../config/env");
const { signUnsubscribe } = require("../../utils/communicationToken.utils");
function renderBlock(block) {
  const text = escapeHtml(block.text || "").replace(/\n/g, "<br>");
  if (block.type === "HEADING")
    return `<h${block.level || 2}>${text}</h${block.level || 2}>`;
  if (block.type === "TEXT") return `<p>${text}</p>`;
  if (block.type === "QUOTE") return `<blockquote>${text}</blockquote>`;
  if (block.type === "LIST")
    return `<ul>${(block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  if (block.type === "SEPARATOR") return "<hr>";
  if (block.type === "BUTTON")
    return `<p><a style="display:inline-block;padding:12px 20px;background:#9f5f5d;color:#fff;text-decoration:none;border-radius:999px" href="${escapeHtml(block.url)}">${escapeHtml(block.label)}</a></p>`;
  if (block.type === "CALLOUT")
    return `<div style="padding:16px;background:#fae8e6;border-radius:12px">${text}</div>`;
  if (block.type === "IMAGE")
    return `<figure><img style="max-width:100%;height:auto" src="${env.CLIENT_URL}/media/${block.image}" alt="${escapeHtml(block.altText || "")}"></figure>`;
  if (["RESOURCE", "WEBINAR"].includes(block.type)) {
    const snapshot = block.snapshot || {};
    return `<section><h2>${escapeHtml(snapshot.title || "")}</h2><p>${escapeHtml(snapshot.description || "")}</p>${snapshot.url ? `<p><a href="${escapeHtml(snapshot.url)}">Découvrir</a></p>` : ""}</section>`;
  }
  return "";
}
function textBlock(block) {
  if (["TEXT", "HEADING", "QUOTE", "CALLOUT"].includes(block.type))
    return block.text || "";
  if (block.type === "LIST")
    return (block.items || []).map((x) => `- ${x}`).join("\n");
  if (block.type === "BUTTON") return `${block.label}: ${block.url}`;
  if (["RESOURCE", "WEBINAR"].includes(block.type))
    return `${block.snapshot?.title || ""}\n${block.snapshot?.url || ""}`;
  return "";
}
function render(communication, recipientEmail = null, test = false) {
  const body = (communication.blocks || []).map(renderBlock).join("\n");
  const unsubscribe =
    recipientEmail && communication.type !== "ADMINISTRATIVE"
      ? `${env.CLIENT_URL}/communications/unsubscribe?token=${signUnsubscribe(recipientEmail)}`
      : null;
  const htmlContent = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#302827;max-width:680px;margin:auto">${communication.preheader ? `<div style="display:none">${escapeHtml(communication.preheader)}</div>` : ""}${body}${unsubscribe ? `<hr><p style="font-size:12px"><a href="${unsubscribe}">Gérer mes préférences ou me désabonner</a></p>` : ""}</div>`;
  const textContent =
    (communication.blocks || []).map(textBlock).filter(Boolean).join("\n\n") +
    (unsubscribe ? `\n\nGérer mes préférences : ${unsubscribe}` : "");
  return {
    subject: `${test ? "[TEST] " : ""}${communication.subject || communication.internalTitle}`,
    htmlContent,
    textContent,
  };
}
module.exports = { render, renderBlock, textBlock };
