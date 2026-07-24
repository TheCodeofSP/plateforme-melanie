const env = require("../../config/env");
const { emailButton, emailCallout, emailLinkFallback } = require("../shared/emailComponents");
const createEmailLayout = require("../shared/emailLayout");
const escapeHtml = require("./escapeHtml");

function createEmailChangeConfirmationTemplate({ firstName, token }) {
  const safeFirstName = escapeHtml(firstName);
  const confirmationUrl = `${env.CLIENT_URL}/confirmer-changement-email?token=${encodeURIComponent(token)}`;

  return {
    subject: "Confirme ta nouvelle adresse email",
    htmlContent: createEmailLayout({
      preheader: "Confirme la nouvelle adresse associée à ton compte.",
      eyebrow: "Sécurité du compte",
      title: "Confirme ta nouvelle adresse",
      content: `
        <p style="margin: 0 0 16px;">Bonjour ${safeFirstName},</p>
        <p style="margin: 0 0 16px;">
          Utilise le bouton ci-dessous pour confirmer cette nouvelle adresse email et terminer la modification de ton compte.
        </p>
        ${emailButton({ href: confirmationUrl, label: "Confirmer ma nouvelle adresse" })}
        ${emailCallout('<p style="margin: 0;">Ton ancienne adresse reste active tant que cette étape n’est pas terminée. Le lien est valable pendant 24 heures.</p>', "green")}
        ${emailLinkFallback(confirmationUrl)}
        <p style="margin: 24px 0 0; color: #786e6f; font-size: 13px;">
          Si tu n’es pas à l’origine de cette demande, tu peux ignorer cet email.
        </p>
      `,
    }),
  };
}

module.exports = createEmailChangeConfirmationTemplate;
