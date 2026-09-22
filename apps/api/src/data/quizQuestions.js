const questions = [
  {
    id: "q1",
    category: "MENSTRUAL_CYCLE",
    title: "Combien de temps dure ton cycle menstruel ?",
    answers: [
      {
        key: "cycle_moins_21",
        label: "Moins de 21 jours",
        profiles: ["DOUCE_MELANCOLIE"],
      },
      {
        key: "cycle_plus_35",
        label: "Plus de 35 jours",
        profiles: ["GONFLEE_A_BLOC"],
      },
      {
        key: "cycle_irregulier",
        label: "Cycle irrégulier (10 jours ou plus d’écart entre chaque cycle)",
        profiles: ["BOULE_DE_NERFS"],
      },
      { key: "cycle_21_35", label: "Entre 21 et 35 jours", profiles: [] },
    ],
  },
  {
    id: "q2",
    category: "MENSTRUAL_CYCLE",
    title: "Quelle est la durée de ta phase lutéale ?",
    answers: [
      { key: "luteale_13_16", label: "13 à 16 jours", profiles: [] },
      {
        key: "luteale_10_12",
        label: "10 à 12 jours",
        profiles: ["BOULE_DE_NERFS"],
      },
      {
        key: "luteale_moins_9",
        label: "Moins de 9 jours",
        profiles: ["GONFLEE_A_BLOC"],
      },
      { key: "luteale_inconnue", label: "Je ne sais pas", profiles: [] },
    ],
  },
  {
    id: "q3",
    category: "MENSTRUAL_CYCLE",
    title: "Comment est ton flux ?",
    helpText:
      "Un flux normal correspond à environ 80 ml sur l’ensemble des règles.",
    answers: [
      {
        key: "flux_tres_peu",
        label: "Très peu de saignements",
        profiles: ["CROQUE_TOUT", "DOUCE_MELANCOLIE"],
      },
      { key: "flux_abondant", label: "Abondant", profiles: ["GONFLEE_A_BLOC"] },
      {
        key: "flux_hemorragique",
        label: "Hémorragique",
        profiles: ["BOULE_DE_NERFS"],
      },
      { key: "flux_normal", label: "Normal", profiles: [] },
    ],
  },
  {
    id: "q4",
    category: "MENSTRUAL_CYCLE",
    title: "Quelle est la durée de tes règles ?",
    answers: [
      {
        key: "regles_1_2",
        label: "1 à 2 jours",
        profiles: ["DOUCE_MELANCOLIE"],
      },
      { key: "regles_3_7", label: "3 à 7 jours", profiles: [] },
      {
        key: "regles_plus_7",
        label: "Plus de 7 jours",
        profiles: ["BOULE_DE_NERFS"],
      },
      { key: "regles_inconnue", label: "Je ne sais pas", profiles: [] },
    ],
  },
  {
    id: "q5",
    category: "MENSTRUAL_CYCLE",
    title: "Qu’as-tu remarqué de plus durant tes règles ?",
    answers: [
      {
        key: "sang_epais",
        label: "Du sang épais",
        profiles: ["GONFLEE_A_BLOC", "BOULE_DE_NERFS"],
      },
      {
        key: "gros_caillots",
        label: "La présence de gros caillots",
        profiles: ["CROQUE_TOUT"],
      },
      {
        key: "secheresse",
        label: "De la sécheresse (peau, vulve…)",
        profiles: ["DOUCE_MELANCOLIE"],
      },
      { key: "remarque_inconnue", label: "Je ne sais pas", profiles: [] },
    ],
  },
  {
    id: "q9",
    category: "PHYSICAL_SYMPTOMS",
    title:
      "Quel symptôme est le plus contraignant pendant ta phase prémenstruelle ?",
    answers: [
      {
        key: "pleurer",
        label: "L’envie de pleurer",
        profiles: ["DOUCE_MELANCOLIE"],
      },
      { key: "acne", label: "L’acné hormonale", profiles: ["GONFLEE_A_BLOC"] },
      {
        key: "fringale",
        label: "Les fringales alimentaires (sucre, chocolat, fromage…)",
        profiles: ["CROQUE_TOUT"],
      },
      {
        key: "maux_tete",
        label: "Les maux de tête",
        profiles: ["BOULE_DE_NERFS"],
      },
    ],
  },
  {
    id: "q11",
    category: "PHYSICAL_SYMPTOMS",
    title: "Parmi ces symptômes physiques, lequel te correspond le plus ?",
    answers: [
      {
        key: "etourdissement",
        label: "Des étourdissements",
        profiles: ["CROQUE_TOUT"],
      },
      {
        key: "gonflements",
        label: "Des gonflements (pieds, mains, seins ou ventre)",
        profiles: ["GONFLEE_A_BLOC"],
      },
      {
        key: "migraine",
        label: "Des migraines",
        profiles: ["DOUCE_MELANCOLIE"],
      },
      {
        key: "douleur_articulaire",
        label: "Des douleurs articulaires",
        profiles: ["BOULE_DE_NERFS"],
      },
    ],
  },
  {
    id: "q6",
    category: "EMOTIONAL_SYMPTOMS",
    title: "Durant ta phase prémenstruelle, quelle est ton émotion dominante ?",
    answers: [
      {
        key: "anxiete",
        label: "L’anxiété ou la peur",
        profiles: ["BOULE_DE_NERFS"],
      },
      {
        key: "fragilite",
        label: "Une sensation de fragilité",
        profiles: ["CROQUE_TOUT"],
      },
      { key: "colere", label: "La colère", profiles: ["GONFLEE_A_BLOC"] },
      {
        key: "tristesse",
        label: "La tristesse ou un état dépressif",
        profiles: ["DOUCE_MELANCOLIE"],
      },
    ],
  },
  {
    id: "q7",
    category: "EMOTIONAL_SYMPTOMS",
    title: "Quelle affirmation te représente le plus ?",
    answers: [
      {
        key: "insomnies",
        label: "J’ai des insomnies fréquentes",
        profiles: ["BOULE_DE_NERFS"],
      },
      {
        key: "injustice",
        label: "Je ressens un fort sentiment d’injustice",
        profiles: ["GONFLEE_A_BLOC"],
      },
      {
        key: "apathique",
        label:
          "Je me sens apathique (perte de motivation, de désir ou d’émotions)",
        profiles: ["DOUCE_MELANCOLIE"],
      },
      {
        key: "fatigue",
        label: "Je suis toujours très fatiguée",
        profiles: ["CROQUE_TOUT"],
      },
    ],
  },
  {
    id: "q8",
    category: "EMOTIONAL_SYMPTOMS",
    title: "Quelle combinaison te correspond le plus ?",
    answers: [
      {
        key: "irritabilite",
        label: "Irritabilité et sautes d’humeur",
        profiles: ["BOULE_DE_NERFS"],
      },
      {
        key: "epuisement",
        label: "Évanouissement ou fatigue physique",
        profiles: ["CROQUE_TOUT"],
      },
      {
        key: "frustration",
        label: "Forte irritabilité ou frustration",
        profiles: ["GONFLEE_A_BLOC"],
      },
      {
        key: "repli",
        label: "Mollesse ou repli sur soi",
        profiles: ["DOUCE_MELANCOLIE"],
      },
    ],
  },
  {
    id: "q10",
    category: "EMOTIONAL_SYMPTOMS",
    title: "Parmi ces symptômes émotionnels, lequel te correspond le plus ?",
    answers: [
      {
        key: "stress",
        label: "La nervosité ou le stress",
        profiles: ["BOULE_DE_NERFS"],
      },
      {
        key: "ruminations",
        label: "Les ruminations",
        profiles: ["GONFLEE_A_BLOC"],
      },
      {
        key: "confusion",
        label: "La confusion ou le brouillard mental",
        profiles: ["DOUCE_MELANCOLIE"],
      },
      {
        key: "fatigue_psychique",
        label: "La fatigue psychique (envie constante de dormir)",
        profiles: ["CROQUE_TOUT"],
      },
    ],
  },
];

module.exports = questions;
