import { routes } from "../config/routes.config.js";

export const footerContent = {
  mission: "Une pause pour mieux comprendre. Des repères pour continuer.",

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
