import { routes } from "../config/routes.config.js";
import { platformContent } from "./platform.content.js";

export const navigationContent = {
  brand: platformContent.brand.name,
  slogan: platformContent.brand.slogan,
  primaryLinks: [
    { label: "La Clairière", to: routes.platform },
    { label: "Ressources", to: routes.resources },
    { label: "Accompagnements", to: routes.accompaniments },
    { label: "Le forum", to: routes.community },
  ],
  discoveryLinks: [
    { label: "Quiz SPM", to: routes.quiz },
    { label: "Webinaires", to: routes.webinars },
    { label: "Mélanie", to: routes.vision },
  ],
  actions: {
    resources: {
      label: "Explorer les ressources",
      to: routes.resources,
    },
    login: {
      label: "Se connecter",
      to: routes.login,
    },
    registration: {
      label: "Créer mon espace",
      to: routes.registration,
    },
  },
};
