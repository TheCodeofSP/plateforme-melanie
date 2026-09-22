const layout = require("./layout");
module.exports = ({ title, meetUrl }) => ({
  subject: `Rappel et lien Google Meet — ${title}`,
  htmlContent: layout(
    "Rendez-vous dans une heure",
    `« ${title} » commence bientôt.`,
    "Rejoindre Google Meet",
    meetUrl,
  ),
});
