const DOCUMENT_VERSIONS = require("../config/documentVersions");

const rules = [
  {
    title: "La bienveillance en priorité",
    text: "Respect, écoute et empathie sont les bases des échanges. Les désaccords sont les bienvenus, tant qu’ils restent respectueux.",
  },
  {
    title: "Ce qui est partagé ici reste ici",
    text: "Les témoignages, histoires, photos ou autres ne sortent pas de La Clairière sans l’accord de la personne concernée.",
  },
  {
    title: "Aucun jugement, aucune discrimination",
    text: "Les corps, les parcours, les choix et les histoires de chacune sont différents. Ils ont tous leur place ici.",
  },
  {
    title: "La Clairière ne remplace pas un professionnel de santé",
    text: "Les échanges permettent d’apprendre et de partager, mais ne remplacent pas un diagnostic ou un accompagnement médical.",
  },
  {
    title: "De la douceur dans tes mots",
    text: "Certains sujets peuvent être intimes ou sensibles. Avant de répondre, pense à l’impact que tes mots peuvent avoir sur la personne qui les recevra.",
  },
];

module.exports = {
  version: DOCUMENT_VERSIONS.SAFE_PLACE_CHARTER,
  title: "La charte du forum de La Clairière",
  introduction:
    "Cet espace est là pour échanger, apprendre, poser ses questions et mieux se connaître, dans un cadre de confiance et de sécurité.",
  invitation: "Pour préserver cet espace, quelques règles simples :",
  rules,
  principles: rules.map((rule) => `${rule.title} — ${rule.text}`),
  closing:
    "L’esprit de La Clairière est de créer un espace où chacune peut avancer à son rythme, avec ses propres ressources et son propre chemin.",
  welcome: "Bienvenue dans le forum de La Clairière !",
  disclaimer:
    "Le forum de La Clairière ne remplace pas un diagnostic ni un accompagnement médical.",
};
