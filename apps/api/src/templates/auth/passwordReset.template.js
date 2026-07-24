const env = require("../../config/env");
const { emailButton, emailCallout, emailLinkFallback } = require("../shared/emailComponents");
const createEmailLayout = require("../shared/emailLayout");
const escapeHtml = require("./escapeHtml");

function createPasswordResetTemplate({ firstName, token }) {
  const safeFirstName = escapeHtml(firstName);
  const resetUrl = `${env.CLIENT_URL}/reinitialiser-mot-de-passe?token=${encodeURIComponent(token)}`;

  return {
    subject: "Choisis un nouveau mot de passe",
    htmlContent: createEmailLayout({
      preheader: "Sécurise ton compte avec un nouveau mot de passe.",
      eyebrow: "Sécurité du compte",
      title: "Réinitialise ton mot de passe",
      content: `
        <p style="margin: 0 0 16px;">Bonjour ${safeFirstName},</p>
        <p style="margin: 0 0 16px;">
          Une demande de réinitialisation a été faite pour ton compte. Tu peux choisir un nouveau mot de passe grâce au bouton ci-dessous.
        </p>
        ${emailButton({ href: resetUrl, label: "Choisir un nouveau mot de passe" })}
        ${emailCallout('<p style="margin: 0;">Ce lien est personnel et reste valable pendant une heure.</p>', "neutral")}
        ${emailLinkFallback(resetUrl)}
        <p style="margin: 24px 0 0; color: #786e6f; font-size: 13px;">
          Si tu n’as pas fait cette demande, ne clique pas sur le lien. Ton mot de passe actuel restera inchangé.
        </p>
      `,
    }),
  };
}

module.exports = createPasswordResetTemplate;
