import { routes } from "../config/routes.config.js";

export const clairiereContent = {
  hero: {
    eyebrow: "Bienvenue dans La Clairière",
    title: "Une pause sur ton chemin.",
    text: "Un espace ouvert et lumineux où tu peux ralentir, déposer ce que tu traverses et retrouver des repères avant de poursuivre à ton rythme.",
  },
  meaning: {
    title: "Pourquoi une clairière ?",
    paragraphs: [
      "Au cours d’une randonnée, la clairière n’est ni le départ ni l’arrivée. C’est un endroit que l’on découvre en avançant : on s’y arrête, on reprend son souffle et l’on regarde le chemin parcouru.",
      "Mélanie a imaginé cette plateforme pour offrir cette même respiration aux personnes qui vivent des questionnements gynécologiques, menstruels ou liés à leur fertilité.",
    ],
  },
  reasons: {
    title:
      "Un espace né d’un besoin simple : ne plus devoir avancer sans repères.",
    items: [
      "Commencer sans avoir toutes les réponses.",
      "Trouver des explications accessibles et prudentes.",
      "Conserver des ressources adaptées à son vécu.",
      "Échanger sous pseudonyme dans un cadre bienveillant.",
      "Rencontrer Mélanie lorsque l’on souhaite aller plus loin.",
    ],
  },
  spaces: [
    {
      title: "Le Quiz SPM",
      text: "Un premier miroir pour mieux comprendre les jours qui précèdent les règles.",
      to: routes.quiz,
    },
    {
      title: "Les ressources",
      text: "Des repères éditoriaux proposés selon ton profil et tes besoins.",
      to: routes.resources,
    },
    {
      title: "Le forum",
      text: "Un espace confidentiel pour écouter, partager et se sentir moins seul·e.",
      to: routes.community,
    },
    {
      title: "Les webinaires",
      text: "Des temps collectifs pour approfondir un sujet et poser ses questions.",
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
