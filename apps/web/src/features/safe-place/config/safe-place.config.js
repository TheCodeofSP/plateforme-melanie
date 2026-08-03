export const reactionOptions = [
  { value: "SUPPORT", label: "Je te soutiens", symbol: "♡" },
  { value: "THANK_YOU", label: "Merci", symbol: "✦" },
  { value: "ME_TOO", label: "Moi aussi", symbol: "≈" },
  { value: "HELPFUL", label: "Utile", symbol: "◇" },
];

export const reportReasons = [
  { value: "OFFENSIVE", label: "Contenu offensant" },
  { value: "HARASSMENT", label: "Harcèlement" },
  { value: "MEDICAL_MISINFORMATION", label: "Information médicale trompeuse" },
  { value: "SPAM_SOLICITATION", label: "Spam ou démarchage" },
  { value: "INAPPROPRIATE", label: "Contenu inapproprié" },
  { value: "DANGER", label: "Situation dangereuse" },
  { value: "OTHER", label: "Autre motif" },
];

export const contentStatusLabels = {
  VISIBLE: "Visible",
  AUTHOR_DELETED: "Supprimé",
  MODERATED: "Modéré",
  PENDING_CORRECTION: "Correction demandée",
  PENDING_REVIEW: "Correction en cours d’examen",
};

export const emptyDiscussion = {
  categoryId: "",
  title: "",
  content: "",
  links: [],
  images: [],
  allowComments: true,
  allowReactions: true,
  notifyMembers: false,
};
