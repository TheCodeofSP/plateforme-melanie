export const resourceFormats = {
  ARTICLE: { label: "Article", icon: "✦", public: true },
  PODCAST: { label: "Podcast", icon: "◉", public: true },
  AUDIO: { label: "Audio", icon: "♪", public: false },
  VIDEO: { label: "Vidéo", icon: "▶", public: true },
  TOOL: { label: "Outil", icon: "◇", public: true },
  EBOOK: { label: "Livret", icon: "▤", public: true },
  NEWSLETTER: { label: "Newsletter", icon: "✉", public: true },
};

export const publicResourceFormats = Object.entries(resourceFormats)
  .filter(([, format]) => format.public)
  .map(([value, format]) => ({ value, label: format.label }));

export const publicationLabels = {
  DRAFT: "Brouillon",
  SCHEDULED: "Publication programmée",
  PUBLISHED: "Publiée",
  UNPUBLISHED: "Dépubliée",
  ARCHIVED: "Archivée",
};

export const reviewLabels = {
  NOT_SUBMITTED: "Non soumise",
  PENDING_REVIEW: "En attente de validation",
  CHANGES_REQUESTED: "Corrections demandées",
  APPROVED: "Validée",
};

export const reportReasons = [
  { value: "OFFENSIVE", label: "Contenu offensant" },
  { value: "MISINFORMATION", label: "Information trompeuse" },
  { value: "SPAM", label: "Contenu indésirable" },
  { value: "INAPPROPRIATE", label: "Contenu inapproprié" },
  { value: "OTHER", label: "Autre motif" },
];

export const emptyResourceVersion = {
  title: "",
  description: "",
  format: "ARTICLE",
  categories: [],
  recommendedSpmProfiles: [],
  keywords: [],
  durationMinutes: 5,
  proposedVisibility: "PUBLIC",
  coverMedia: null,
  coverAlt: "",
  blocks: [{ type: "PARAGRAPH", text: "" }],
  sourceMode: "TEXT",
  media: null,
  pdf: null,
  externalUrl: "",
  externalPlatform: "",
  showName: "",
  episodeNumber: null,
};
