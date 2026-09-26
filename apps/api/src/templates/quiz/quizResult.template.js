const profileContents = require("../../data/quizProfileContents");

function escapeHtml(value) {
  return String(value).replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character],
  );
}

function createQuizResultTemplate({ firstName, profile, isMember, clientUrl, resources = [] }) {
  const content = profileContents[profile];
  const destination = isMember ? `${clientUrl}/mon-espace/profil-spm` : `${clientUrl}/inscription`;
  const button = isMember
    ? "Découvrir mon parcours personnalisé"
    : "Créer mon compte et découvrir mon parcours";
  const resourceItems = resources
    .map(
      (resource) =>
        `<li style="margin:0 0 10px"><a href="${escapeHtml(resource.url)}" style="color:#8f5d5c;font-weight:700">${escapeHtml(resource.title)}</a></li>`,
    )
    .join("");
  const resourceSection = resourceItems
    ? `<div style="margin:28px 0;padding:22px;background:#fff6f2;border-radius:18px"><h2 style="font-size:22px;margin:0 0 14px">Trois ressources pour poursuivre</h2><ul style="margin:0;padding-left:20px">${resourceItems}</ul></div>`
    : "";

  return {
    subject: `Ton profil SPM : ${content.title} 🌸`,
    htmlContent: `<div style="margin:0;background:#fffdfb;font-family:Arial,sans-serif;color:#302827"><div style="max-width:680px;margin:auto;padding:40px 22px"><p style="color:#9f5f5d;font-weight:700">Quiz SPM</p><h1 style="font-size:34px">Bonjour ${escapeHtml(firstName)} 🌸</h1><p style="font-size:18px;line-height:1.7">Ton profil est <strong>${escapeHtml(content.title)}</strong>.</p><p style="font-size:16px;line-height:1.8">${escapeHtml(content.summary)}</p>${resourceSection}<p style="margin:30px 0"><a href="${destination}" style="display:inline-block;padding:14px 22px;background:#c98986;color:#fff;text-decoration:none;border-radius:999px;font-weight:700">${button}</a></p><p style="font-size:15px;line-height:1.7">Si tu souhaites échanger autour de ce résultat, tu peux aussi <a href="${clientUrl}/contact" style="color:#8f5d5c;font-weight:700">contacter Mélanie</a>.</p><p style="font-size:13px;line-height:1.6;color:#756967">Ce quiz n’est pas un diagnostic médical. Si tes symptômes perturbent ton quotidien, pense à consulter un·e professionnel·le de santé.</p></div></div>`,
  };
}

module.exports = { createQuizResultTemplate };
