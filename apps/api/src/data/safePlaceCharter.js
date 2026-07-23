const DOCUMENT_VERSIONS = require("../config/documentVersions");
module.exports = {
  version: DOCUMENT_VERSIONS.SAFE_PLACE_CHARTER,
  title: "Charte du Safe Place",
  principles: [
    "Respecter la parole, l’expérience et les limites de chaque membre.",
    "Ne publier aucun propos discriminatoire, humiliant, violent ou harcelant.",
    "Ne pas utiliser le Safe Place pour prospecter, vendre ou démarcher.",
    "Présenter les témoignages comme des expériences personnelles et non comme des diagnostics.",
    "Ne pas partager les informations personnelles d’une autre personne.",
    "Signaler à Mélanie tout contenu qui met une personne en danger ou enfreint la charte.",
  ],
  disclaimer:
    "Le Safe Place ne remplace pas un accompagnement médical, psychologique ou un service d’urgence.",
};
