import { appConfig } from "../config/app.config.js";

export const safePlaceContent = {
  name: appConfig.communityName,
  landing: {
    eyebrow: "Espace communautaire",
    title: `Bienvenue dans ${appConfig.communityName}`,
    introduction:
      "Un espace pour s’arrêter, déposer ce que tu traverses et rencontrer d’autres personnes avant de poursuivre ton chemin.",
    privacy: "Ici, ton pseudonyme protège ton identité publique.",
  },
  empty: {
    discussions:
      "Le chemin est encore silencieux ici. Tu peux ouvrir la première discussion lorsque tu te sentiras prête.",
    comments: "Aucune parole n’a encore été déposée sous cette discussion.",
    personal: "Tu n’as encore rien déposé dans cet espace.",
  },
  composer: {
    privacy:
      "Avant de publier, vérifie que ton texte et tes images ne révèlent aucune information que tu souhaites garder privée.",
    mention:
      "Pour mentionner une personne, écris son pseudonyme précédé de @, par exemple @pseudonyme.",
  },
};
