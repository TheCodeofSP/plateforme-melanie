const createEmailLayout = require("../shared/emailLayout");
const escapeHtml = require("./escapeHtml");

function createEmailChangeCompletedTemplate({ firstName, newEmail }) {
  return {
    subject: "L’adresse email de ton compte a été modifiée",
    htmlContent: createEmailLayout({
      preheader: "Confirmation du changement d’adresse email.",
      eyebrow: "Sécurité du compte",
      title: "Changement d’adresse confirmé",
      content: `<p style="margin: 0 0 16px;">Bonjour ${escapeHtml(firstName)},</p><p style="margin: 0 0 16px;">L’adresse email de ton compte vient d’être remplacée par <strong>${escapeHtml(newEmail)}</strong>.</p><p style="margin: 0; color: #765354; font-weight: 700;">Si tu n’es pas à l’origine de cette modification, contacte Mélanie depuis la page Contact afin de sécuriser ton compte.</p>`,
    }),
  };
}
module.exports = createEmailChangeCompletedTemplate;
