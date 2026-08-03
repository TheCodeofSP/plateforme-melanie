import { legalConfig } from "./legal.config.js";

export const legalPagesContent = {
  notice: {
    eyebrow: "Informations légales",
    title: "Mentions légales",
    introduction: "Les informations encore inconnues sont volontairement signalées afin d’être complétées avant la mise en ligne.",
    sections: [
      { title: "Édition", paragraphs: [`Éditeur : ${legalConfig.legalName}`, `Statut : ${legalConfig.legalStatus}`, `Immatriculation : ${legalConfig.registrationNumber}`, `Adresse : ${legalConfig.address}`, `Directrice de la publication : ${legalConfig.publicationDirector}`, `Contact : ${legalConfig.contactEmail}`] },
      { title: "Hébergement", paragraphs: [`Front : ${legalConfig.frontHost}`, `API : ${legalConfig.apiHost}`, `Base de données : ${legalConfig.databaseHost}`, `Région de stockage : ${legalConfig.dataRegion}`] },
      { title: "Propriété intellectuelle", paragraphs: ["Les textes, éléments graphiques, marques et contenus de La Clairière sont protégés. Leur réutilisation nécessite l’autorisation préalable de leur titulaire, sauf exception prévue par la loi."] },
    ],
  },
  cookies: {
    eyebrow: "Tes choix",
    title: "Politique relative aux cookies",
    introduction: "La Clairière distingue les éléments indispensables au fonctionnement de la plateforme et la mesure d’audience facultative.",
    sections: [
      { title: "Fonctionnement essentiel", paragraphs: ["Les éléments techniques indispensables permettent notamment la connexion, la sécurité et la conservation temporaire de tes choix. Ils ne peuvent pas être désactivés depuis le bandeau."] },
      { title: "Mesure d’audience", paragraphs: ["Google Analytics est chargé uniquement après ton accord. Aucune réponse au Quiz, adresse email, pseudonyme ou publication du Cercle n’est transmise à cet outil."] },
      { title: "Modifier ton choix", paragraphs: ["Le lien « Gérer mes cookies », présent dans le pied de page, permet de modifier ton choix à tout moment."] },
    ],
  },
  accessibility: {
    eyebrow: "Un espace pour chacun·e",
    title: "Déclaration d’accessibilité",
    introduction: "La Clairière vise le niveau AA des règles internationales WCAG 2.2. Un audit réglementaire complet reste à réaliser avant de déclarer une conformité totale.",
    sections: [
      { title: "Mesures mises en place", paragraphs: ["Navigation au clavier, focus visible, structure sémantique, alternatives textuelles, contrastes contrôlés, formulaires explicites et réduction des animations selon les préférences du système."] },
      { title: "Signaler une difficulté", paragraphs: [`Si un contenu ou un parcours reste difficile à utiliser, écris à ${legalConfig.contactEmail} en précisant la page et le problème rencontré.`] },
      { title: "État de conformité", paragraphs: ["Audit complet à planifier avant mise en ligne. Cette page ne constitue pas encore une déclaration réglementaire définitive."] },
    ],
  },
};
