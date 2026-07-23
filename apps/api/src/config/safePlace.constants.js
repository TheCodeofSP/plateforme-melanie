const SAFE_PLACE_REACTIONS = ["SUPPORT", "THANK_YOU", "ME_TOO", "HELPFUL"];
const SAFE_PLACE_CONTENT_STATUSES = [
  "VISIBLE",
  "AUTHOR_DELETED",
  "MODERATED",
  "PENDING_CORRECTION",
  "PENDING_REVIEW",
];
const SAFE_PLACE_REPORT_REASONS = [
  "OFFENSIVE",
  "HARASSMENT",
  "MEDICAL_MISINFORMATION",
  "SPAM_SOLICITATION",
  "INAPPROPRIATE",
  "DANGER",
  "OTHER",
];
const SAFE_PLACE_REPORT_STATUSES = [
  "OPEN",
  "IN_REVIEW",
  "WAITING_CORRECTION",
  "RESOLVED",
  "REJECTED",
];
const SAFE_PLACE_INITIAL_CATEGORIES = [
  {
    name: "SPM et symptômes prémenstruels",
    slug: "spm-symptomes-premenstruels",
    description: "Échanger autour du SPM et des symptômes prémenstruels.",
    displayOrder: 10,
  },
  {
    name: "Cycle menstruel",
    slug: "cycle-menstruel",
    description: "Partager ses expériences autour du cycle menstruel.",
    displayOrder: 20,
  },
  {
    name: "Émotions et santé mentale",
    slug: "emotions-sante-mentale",
    description:
      "Un espace d’écoute autour des émotions et du bien-être psychique.",
    displayOrder: 30,
  },
  {
    name: "Alimentation et digestion",
    slug: "alimentation-digestion",
    description: "Échanger autour de l’alimentation et de la digestion.",
    displayOrder: 40,
  },
  {
    name: "Relations et sexualité",
    slug: "relations-sexualite",
    description:
      "Parler des relations et de la sexualité dans le respect de la charte.",
    displayOrder: 50,
  },
  {
    name: "Vie sociale et professionnelle",
    slug: "vie-sociale-professionnelle",
    description:
      "Partager les répercussions dans la vie sociale et professionnelle.",
    displayOrder: 60,
  },
  {
    name: "Partage et espace libre",
    slug: "partage-espace-libre",
    description:
      "Un espace libre pour les sujets qui ne trouvent pas leur place ailleurs.",
    displayOrder: 70,
  },
  {
    name: "Annonces de Mélanie",
    slug: "annonces-melanie",
    description: "Les informations importantes publiées par Mélanie.",
    displayOrder: 80,
    adminOnly: true,
  },
];
module.exports = {
  SAFE_PLACE_REACTIONS,
  SAFE_PLACE_CONTENT_STATUSES,
  SAFE_PLACE_REPORT_REASONS,
  SAFE_PLACE_REPORT_STATUSES,
  SAFE_PLACE_INITIAL_CATEGORIES,
};
