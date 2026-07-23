const env = require("../../config/env");
const escapeHtml = require("./escapeHtml");

function createEmailChangeConfirmationTemplate({ firstName, token }) {
  const safeFirstName = escapeHtml(firstName);

  const confirmationUrl = `${env.CLIENT_URL}/confirm-email-change?token=${encodeURIComponent(token)}`;

  return {
    subject: "Confirme ta nouvelle adresse email",
    htmlContent: `
      <!doctype html>
      <html lang="fr">
        <body>
          <h1>Confirmation de ta nouvelle adresse</h1>

          <p>Bonjour ${safeFirstName},</p>

          <p>
            Clique sur le lien ci-dessous pour confirmer
            cette nouvelle adresse email.
          </p>

          <p>
            <a href="${confirmationUrl}">
              Confirmer ma nouvelle adresse
            </a>
          </p>

          <p>Ce lien est valable pendant 24 heures.</p>

          <p>
            Si tu n’es pas à l’origine de cette demande,
            tu peux ignorer cet email.
          </p>
        </body>
      </html>
    `,
  };
}

module.exports = createEmailChangeConfirmationTemplate;
