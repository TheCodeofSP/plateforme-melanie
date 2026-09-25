import { routes } from "../config/routes.config.js";
import { platformContent } from "./platform.content.js";

export const navigationContent = {
  brand: platformContent.brand.name,
  slogan: platformContent.brand.slogan,
  clairiereLinks: [
    { label: "Découvrir La Clairière", to: routes.platform },
    { label: "Le forum", to: routes.community },
  ],
  discoveryLinks: [
    { label: "Accompagnements", to: routes.accompaniments },
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
