const layout = require("./layout");
module.exports = ({ title }) => ({
  subject: `Webinaire annulé — ${title}`,
  htmlContent: layout(
    "Session annulée",
    `La session de « ${title} » est annulée. Tu peux consulter les autres dates disponibles sur la plateforme.`,
  ),
});
