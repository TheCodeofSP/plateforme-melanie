function emailButton({ href, label }) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
      <tr>
        <td style="border-radius: 999px; background: #a6787a;">
          <a
            href="${href}"
            style="display: inline-block; padding: 14px 24px; color: #ffffff; font-family: Arial, sans-serif; font-size: 16px; font-weight: 700; line-height: 1.2; text-decoration: none;"
          >
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function emailCallout(content, tone = "rose") {
  const tones = {
    rose: { background: "#f8eeee", border: "#dec4c4" },
    green: { background: "#eff4f1", border: "#dfe8e2" },
    neutral: { background: "#f7f5f5", border: "#eeeaea" },
  };
  const colors = tones[tone] || tones.rose;

  return `
    <div style="margin: 24px 0; padding: 18px; background: ${colors.background}; border: 1px solid ${colors.border}; border-radius: 16px;">
      ${content}
    </div>
  `;
}

function emailLinkFallback(href) {
  return `
    <p style="margin: 24px 0 8px; color: #786e6f; font-size: 13px; line-height: 1.6;">
      Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :
    </p>
    <p style="margin: 0; overflow-wrap: anywhere; color: #786e6f; font-size: 12px; line-height: 1.6;">
      <a href="${href}" style="color: #765354;">${href}</a>
    </p>
  `;
}

module.exports = {
  emailButton,
  emailCallout,
  emailLinkFallback,
};
