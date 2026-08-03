export const webinarStatuses = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
  ARCHIVED: "Archivé",
};

export const registrationStatuses = {
  REGISTERED: "Inscription confirmée",
  WAITLISTED: "Liste d’attente",
  PRESENT: "Présente",
  ABSENT: "Absente",
  CANCELLED: "Désinscrite",
};

export const availabilityLabels = {
  DISPONIBLE: "Places disponibles",
  PRESQUE_COMPLET: "Plus que quelques places",
  COMPLET: "Complet — liste d’attente ouverte",
};

export const spmProfileLabels = {
  BOULE_DE_NERFS: "Boule de nerfs",
  CROQUE_TOUT: "Croque-tout",
  DOUCE_MELANCOLIE: "Douce mélancolie",
  GONFLEE_A_BLOC: "Gonflée à bloc",
};

export function formatWebinarDate(value) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(new Date(value));
}
