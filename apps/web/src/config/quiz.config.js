export const quizStages = {
  preparation: "PREPARATION",
  transition: "CATEGORY_TRANSITION",
  question: "QUESTION",
  review: "REVIEW",
  guestIdentity: "GUEST_IDENTITY",
  accountLogin: "ACCOUNT_LOGIN",
  submitting: "SUBMITTING",
  profileSelection: "PROFILE_SELECTION",
  completed: "COMPLETED",
};

export const quizCategories = {
  MENSTRUAL_CYCLE: {
    className: "cycle",
    kicker: "Première escale",
    title: "Commençons par ton cycle",
    text: "Commençons par observer son rythme et la façon dont tes règles se manifestent.",
    symbol: "○",
  },
  PHYSICAL_SYMPTOMS: {
    className: "physical",
    kicker: "Deuxième escale",
    title: "Écoutons maintenant ton corps",
    text: "Quelques questions pour identifier les manifestations qui prennent le plus de place avant tes règles.",
    symbol: "≈",
  },
  EMOTIONAL_SYMPTOMS: {
    className: "emotional",
    kicker: "Dernière escale",
    title: "Faisons une place à ton ressenti",
    text: "Il n’y a pas de bonne ou de mauvaise réponse. Choisis simplement ce qui te ressemble le plus aujourd’hui.",
    symbol: "✦",
  },
};

export const quizProfiles = {
  BOULE_DE_NERFS: { className: "nerves", symbol: "ϟ", label: "Boule de nerfs" },
  CROQUE_TOUT: { className: "comfort", symbol: "◎", label: "Croque-tout" },
  DOUCE_MELANCOLIE: { className: "melancholy", symbol: "☾", label: "Douce mélancolie" },
  GONFLEE_A_BLOC: { className: "wave", symbol: "∿", label: "Gonflée à bloc" },
};
