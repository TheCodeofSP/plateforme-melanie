const env = require("../../config/env");
const { emailButton, emailCallout, emailLinkFallback } = require("../shared/emailComponents");
const createEmailLayout = require("../shared/emailLayout");
const escapeHtml = require("./escapeHtml");

module.exports = function createMagicLoginTemplate({ firstName, token }) {
  const url = `${env.CLIENT_URL}/connexion/lien?token=${encodeURIComponent(token)}`;
  return {
    subject: "Ton lien de connexion à La Clairière",
    htmlContent: createEmailLayout({
      preheader: "Connecte-toi sans mot de passe.",
      eyebrow: "Connexion sécurisée",
      title: "Entre dans ton espace",
      content: `<p>Bonjour ${escapeHtml(firstName)},</p><p>Clique sur le bouton ci-dessous pour te connecter. Ce lien est personnel, temporaire et utilisable une seule fois.</p>${emailButton({ href: url, label: "Me connecter à La Clairière" })}${emailCallout('<p style="margin:0;">Ce lien reste valable pendant 15 minutes.</p>', "green")}${emailLinkFallback(url)}<p style="margin-top:24px;color:#786e6f;font-size:13px;">Si tu n’as pas demandé ce lien, ignore simplement cet email.</p>`,
    }),
  };
};
