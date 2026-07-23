const layout = require("./layout");
module.exports = ({ title, meetUrl }) => ({
  subject: `Nouveau lien Google Meet — ${title}`,
  htmlContent: layout(
    "Lien de connexion modifié",
    `Le lien de « ${title} » a changé.`,
    "Ouvrir le nouveau lien",
    meetUrl,
  ),
});
