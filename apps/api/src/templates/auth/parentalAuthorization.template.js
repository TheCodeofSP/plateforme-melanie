const env = require("../../config/env");
const { emailButton, emailCallout } = require("../shared/emailComponents");
const createEmailLayout = require("../shared/emailLayout");
const escapeHtml = require("./escapeHtml");

function createParentalAuthorizationTemplate({ minorFirstName, token }) {
  const safeMinorFirstName = escapeHtml(minorFirstName);
  const authorizationUrl = `${env.CLIENT_URL}/autorisation-parentale?token=${encodeURIComponent(token)}`;

  return {
    subject: "Autorisation parentale — création d’un compte",
    htmlContent: createEmailLayout({
      preheader: `${safeMinorFirstName} souhaite créer un compte sur la plateforme de Mélanie.`,
      eyebrow: "Autorisation parentale",
      title: "Une demande nécessite votre accord",
      content: `
        <p style="margin: 0 0 16px;">Bonjour,</p>
        <p style="margin: 0 0 16px;">
          ${safeMinorFirstName} souhaite créer un compte sur la plateforme de Mélanie Dizet.
        </p>
        <p style="margin: 0 0 16px;">
          La plateforme propose des ressources autour du cycle menstruel, un quiz informatif et un espace confidentiel d’échange entre membres.
        </p>
        ${emailCallout('<p style="margin: 0;">Le quiz et les contenus proposés ne remplacent pas un avis, un diagnostic ou un suivi médical.</p>', "green")}
        <p style="margin: 0 0 16px;">
          La page suivante présente les informations utiles avant de confirmer ou de refuser cette demande.
        </p>
        ${emailButton({ href: authorizationUrl, label: "Consulter la demande" })}
        <p style="margin: 24px 0 8px; color: #786e6f; font-size: 13px;">
          Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
        </p>
        <p style="margin: 0; overflow-wrap: anywhere; color: #786e6f; font-size: 12px;">
          <a href="${authorizationUrl}" style="color: #765354;">${authorizationUrl}</a>
        </p>
        <p style="margin: 24px 0 0; color: #786e6f; font-size: 13px;">
          Le lien reste valable pendant 7 jours. Si vous ne connaissez pas cette personne ou n’êtes pas son responsable légal, ignorez cet email.
        </p>
      `,
    }),
  };
}

module.exports = createParentalAuthorizationTemplate;
