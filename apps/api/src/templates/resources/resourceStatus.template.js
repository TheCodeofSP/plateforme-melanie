const escapeHtml = require("../auth/escapeHtml");

function resourceStatusTemplate({ recipientName, title, message, comment }) {
  return `
    <div style="font-family:Arial,sans-serif;color:#302827;line-height:1.6">
      <h1 style="color:#9f5f5d">${escapeHtml(title)}</h1>
      <p>Bonjour ${escapeHtml(recipientName)},</p>
      <p>${escapeHtml(message)}</p>
      ${comment ? `<blockquote style="border-left:3px solid #c98986;padding-left:12px">${escapeHtml(comment)}</blockquote>` : ""}
      <p>À bientôt sur la plateforme Mélanie.</p>
    </div>`;
}

module.exports = resourceStatusTemplate;
