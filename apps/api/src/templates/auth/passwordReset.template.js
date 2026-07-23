const env = require("../../config/env");
const escapeHtml = require("./escapeHtml");

function createPasswordResetTemplate({ firstName, token }) {
  const safeFirstName = escapeHtml(firstName);

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${encodeURIComponent(token)}`;

  return {
    subject: "Réinitialise ton mot de passe",
    htmlContent: `
      <!doctype html>
      <html lang="fr">
        <body>
          <h1>Réinitialisation du mot de passe</h1>

          <p>Bonjour ${safeFirstName},</p>

          <p>
            Une demande de réinitialisation du mot de passe
            de ton compte a été effectuée.
          </p>

          <p>
            <a href="${resetUrl}">
              Choisir un nouveau mot de passe
            </a>
          </p>

          <p>Ce lien est valable pendant une heure.</p>

          <p>
            Si tu n’es pas à l’origine de cette demande,
            tu peux ignorer cet email. Ton mot de passe
            actuel restera inchangé.
          </p>
        </body>
      </html>
    `,
  };
}

module.exports = createPasswordResetTemplate;
