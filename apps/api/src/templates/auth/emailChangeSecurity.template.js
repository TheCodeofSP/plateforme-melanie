const { emailCallout } = require("../shared/emailComponents");
const createEmailLayout = require("../shared/emailLayout");
const escapeHtml = require("./escapeHtml");

function createEmailChangeSecurityTemplate({ firstName, newEmail }) {
  const safeFirstName = escapeHtml(firstName);
  const safeNewEmail = escapeHtml(newEmail);

  return {
    subject: "Une demande de changement d’adresse a été faite",
    htmlContent: createEmailLayout({
      preheader: "Information de sécurité concernant ton compte.",
      eyebrow: "Information de sécurité",
      title: "Demande de changement d’adresse email",
      content: `
        <p style="margin: 0 0 16px;">Bonjour ${safeFirstName},</p>
        <p style="margin: 0 0 16px;">
          Une demande a été effectuée pour remplacer l’adresse email de ton compte par :
        </p>
        ${emailCallout(`<p style="margin: 0; color: #514849; font-weight: 700; overflow-wrap: anywhere;">${safeNewEmail}</p>`, "rose")}
        <p style="margin: 0 0 16px;">
          Ton adresse actuelle reste inchangée tant que la nouvelle adresse n’a pas été confirmée.
        </p>
        <p style="margin: 24px 0 0; color: #765354; font-weight: 700;">
          Si tu n’es pas à l’origine de cette demande, ne valide aucun message reçu à la nouvelle adresse et contacte Mélanie depuis la page Contact afin de sécuriser ton compte.
        </p>
      `,
    }),
  };
}

module.exports = createEmailChangeSecurityTemplate;
