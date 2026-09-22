const env = require("../../config/env");
const {
  emailButton,
  emailCallout,
  emailLinkFallback,
} = require("../shared/emailComponents");
const createEmailLayout = require("../shared/emailLayout");
const escapeHtml = require("./escapeHtml");

function createEmailVerificationTemplate({ firstName, token }) {
  const safeFirstName = escapeHtml(firstName);
  const verificationUrl = `${env.CLIENT_URL}/verifier-email?token=${encodeURIComponent(token)}`;

  return {
    subject: "Bienvenue — confirme ton adresse email",
    htmlContent: createEmailLayout({
      preheader: "Une dernière étape pour ouvrir ton espace.",
      eyebrow: "Bienvenue",
      title: "Confirme ton adresse email",
      content: `
        <p style="margin: 0 0 16px;">Bonjour ${safeFirstName},</p>
        <p style="margin: 0 0 16px;">
          Ton compte a bien été créé. Il ne reste qu’une étape pour ouvrir ton espace et poursuivre ton chemin sur la plateforme.
        </p>
        ${emailButton({ href: verificationUrl, label: "Confirmer mon adresse email" })}
        ${emailCallout('<p style="margin: 0;">Ce lien est personnel et reste valable pendant 24 heures.</p>', "green")}
        ${emailLinkFallback(verificationUrl)}
        <p style="margin: 24px 0 0; color: #786e6f; font-size: 13px;">
          Si tu n’es pas à l’origine de cette inscription, tu peux simplement ignorer cet email.
        </p>
      `,
    }),
  };
}

module.exports = createEmailVerificationTemplate;
