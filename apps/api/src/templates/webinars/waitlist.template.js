const layout = require("./layout");
module.exports = ({ title, position }) => ({
  subject: `Liste d’attente — ${title}`,
  htmlContent: layout(
    "Liste d’attente",
    `Tu es en position ${position} pour « ${title} ». Nous te préviendrons si une place se libère.`,
  ),
});
