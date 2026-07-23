const env = require("../../config/env");
const escapeHtml = require("./escapeHtml");

function createParentalAuthorizationTemplate({ minorFirstName, token }) {
  const safeMinorFirstName = escapeHtml(minorFirstName);

  const authorizationUrl = `${env.CLIENT_URL}/parental-authorization?token=${encodeURIComponent(token)}`;

  return {
    subject: "Autorisation parentale pour la création d’un compte",
    htmlContent: `
      <!doctype html>
      <html lang="fr">
        <body>
          <h1>Autorisation parentale</h1>

          <p>Bonjour,</p>

          <p>
            ${safeMinorFirstName} souhaite créer un compte sur la
            plateforme de Mélanie.
          </p>

          <p>
            Cette plateforme propose des ressources autour du cycle,
            un quiz informatif et un espace d’échange entre membres.
          </p>

          <p>
            Le quiz ne remplace pas un avis médical. Il est conçu
            pour aider à mieux comprendre son cycle et à avancer
            à son rythme.
          </p>

          <p>
            Consultez les informations présentées sur la page suivante
            avant de confirmer ou de refuser l’autorisation.
          </p>

          <p>
            <a href="${authorizationUrl}">
              Consulter la demande d’autorisation
            </a>
          </p>

          <p>Ce lien est valable pendant 7 jours.</p>

          <p>
            Si vous ne connaissez pas cette personne ou si vous n’êtes
            pas son responsable légal, ignorez cet email.
          </p>
        </body>
      </html>
    `,
  };
}

module.exports = createParentalAuthorizationTemplate;
