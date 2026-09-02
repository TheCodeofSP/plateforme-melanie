import { routes } from "../config/routes.config.js";

export const clairiereContent = {
  hero: {
    eyebrow: "Bienvenue dans La Clairière",
    title: "Un espace privé pour ne plus avancer seule.",
    text: "Approfondis ta connaissance de ton cycle et de ton bien-être gynécologique, pose tes questions, partage ton expérience et avance entourée de femmes qui vivent leurs propres questionnements.",
  },
  meaning: {
    title: "C’est de ce besoin qu’est née La Clairière.",
    paragraphs: [
      "Vivre avec des douleurs ou des symptômes gynécologiques peut nous faire sentir profondément seule, parce qu’on n’est pas toujours écoutée, ni par les professionnels de santé, ni par son entourage.",
      "On aimerait comprendre ce qui nous arrive, poser des questions et explorer d’autres pistes, sans toujours savoir où trouver un espace pour le faire.",
    ],
  },
  reasons: {
    title:
      "Un espace né d’un besoin simple : ne plus devoir avancer sans repères.",
    items: [
      "Un espace safe pour parler librement et partager son vécu sans jugement.",
      "Des contenus privés pour approfondir la compréhension du cycle et du bien-être gynécologique.",
      "Des espaces de discussion pour réfléchir, échanger et apprendre les unes des autres.",
      "Une communauté, parce que savoir que l’on n’est pas seule change déjà beaucoup de choses.",
    ],
  },
  spaces: [
    {
      title: "Les contenus exclusifs",
      text: "Des ressources privées pour approfondir un thème selon tes besoins.",
      to: routes.resources,
    },
    {
      title: "Le forum",
      text: "Un espace confidentiel pour écouter, partager et se sentir moins seul·e.",
      to: routes.community,
    },
    {
      title: "Les rendez-vous en direct",
      text: "Des temps collectifs pour approfondir un sujet, apprendre et poser ses questions.",
      to: routes.webinars,
    },
  ],
  commitments: [
    "Ton rythme est respecté.",
    "Ton pseudonyme protège ta parole dans le forum.",
    "Le Quiz invite à mieux te comprendre sans poser de diagnostic.",
    "Tes préférences de communication restent modifiables.",
    "Un accompagnement n’est jamais imposé.",
  ],
};
