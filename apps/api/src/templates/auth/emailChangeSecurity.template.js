const env = require("../../config/env");
const escapeHtml = require("./escapeHtml");

function createEmailChangeSecurityTemplate({ firstName, newEmail }) {
  const safeFirstName = escapeHtml(firstName);
  const safeNewEmail = escapeHtml(newEmail);

  return {
    subject: "Demande de changement d’adresse email",
    htmlContent: `
      <!doctype html>
      <html lang="fr">
        <body>
          <h1>Demande de changement d’adresse email</h1>

          <p>Bonjour ${safeFirstName},</p>

          <p>
            Une demande a été effectuée pour remplacer
            l’adresse email de ton compte par :
          </p>

          <p><strong>${safeNewEmail}</strong></p>

          <p>
            Ton adresse actuelle reste inchangée tant que
            la nouvelle adresse n’a pas été confirmée.
          </p>

          <p>
            Si tu n’es pas à l’origine de cette demande,
            modifie ton mot de passe.
          </p>
        </body>
      </html>
    `,
  };
}

module.exports = createEmailChangeSecurityTemplate;
