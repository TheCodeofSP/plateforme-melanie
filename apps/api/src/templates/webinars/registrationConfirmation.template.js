const layout = require("./layout");
module.exports = ({ title }) => ({
  subject: `Inscription confirmée — ${title}`,
  htmlContent: layout(
    "Inscription confirmée",
    `Ta place pour « ${title} » est confirmée.`,
  ),
});
