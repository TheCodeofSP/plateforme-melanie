const env = require("../../config/env");
const escapeHtml = require("./escapeHtml");

function createEmailVerificationTemplate({ firstName, token }) {
  const safeFirstName = escapeHtml(firstName);

  const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${encodeURIComponent(token)}`;

  return {
    subject: "Valide ton adresse email",
    htmlContent: `
      <!doctype html>
      <html lang="fr">
        <body>
          <h1>Bienvenue sur la plateforme de Mélanie</h1>

          <p>Bonjour ${safeFirstName},</p>

          <p>
            Ton compte a bien été créé. Clique sur le lien ci-dessous
            pour valider ton adresse email.
          </p>

          <p>
            <a href="${verificationUrl}">
              Valider mon adresse email
            </a>
          </p>

          <p>Ce lien est valable pendant 24 heures.</p>

          <p>
            Si tu n’es pas à l’origine de cette inscription,
            tu peux ignorer cet email.
          </p>
        </body>
      </html>
    `,
  };
}

module.exports = createEmailVerificationTemplate;
