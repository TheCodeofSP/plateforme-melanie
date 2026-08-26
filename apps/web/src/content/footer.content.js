import { routes } from "../config/routes.config.js";

export const footerContent = {
  mission: "Une pause pour mieux comprendre. Des repères pour continuer.",

  description:
    "La Clairière t’accueille là où tu en es, sur le chemin du bien-être gynécologique.",

  navigation: {
    title: "Explorer",
    links: [
      { label: "Accueil", to: routes.home },
      { label: "La Clairière", to: routes.platform },
      { label: "Mélanie", to: routes.vision },
      { label: "Ressources", to: routes.resources },
      { label: "Accompagnements", to: routes.accompaniments },
      { label: "Contact", to: routes.contact },
    ],
  },

  platform: {
    title: "Plateforme",
    links: [
      {
        label: "Le forum",
        to: routes.community,
      },
      { label: "Quiz SPM", to: routes.quiz },
      { label: "Webinaires", to: routes.webinars },
      { label: "Intervenantes", to: routes.professionals },
    ],
  },

  contact: {
    title: "Contact",
    email: "contact@melaniedizet.com",
    location: "Informations professionnelles à compléter avant mise en ligne",
  },

  legal: [
    { label: "Mentions légales", to: routes.legalNotice },
    {
      label: "Politique de confidentialité",
      to: routes.privacyPolicy,
    },
    { label: "Cookies", to: routes.cookiesPolicy },
    { label: "Accessibilité", to: routes.accessibility },
  ],

  copyright: "© 2026 Mélanie Dizet. Tous droits réservés.",
};
