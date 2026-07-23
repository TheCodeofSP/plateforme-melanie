const layout = require("./layout");
module.exports = ({ title, url }) => ({
  subject: `Une place est disponible — ${title}`,
  htmlContent: layout(
    "Une place est disponible",
    `Confirme rapidement ta place pour « ${title} » avant l’expiration de la proposition.`,
    "Confirmer ma place",
    url,
  ),
});
