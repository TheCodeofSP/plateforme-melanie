import { routes } from "../config/routes.config.js";

export const quizContent = {
  hero: {
    badge: "Quiz SPM",
    title: "Découvre ton profil de SPM",
    subtitle:
      "Quelques minutes pour mieux comprendre les signaux que ton corps t’envoie avant tes règles.",
    text: [
      "Ce quiz t’aide à identifier le profil de SPM qui te correspond le plus et à mieux comprendre les besoins de ton corps, selon l’approche de la Gyn’écologie émotionnelle.",
    ],
    edition: "Édition 01 · Le test éditorial",
    primaryCta: {
      label: "Découvrir comment fonctionne le quiz",
      href: "#quiz-start",
    },
  },

  introduction: {
    title: "SPM, c’est quoi ?",
    paragraphs: [
      "Le syndrome prémenstruel correspond à l’ensemble des symptômes physiques, émotionnels et psychologiques qui apparaissent après l’ovulation et disparaissent avec l’arrivée des règles, ou dans les premiers jours du cycle.",
      "Beaucoup de femmes ressentent ces symptômes à des degrés très variables. Pourtant, leur souffrance est encore trop souvent minimisée.",
      "Le SPM n’est pas une phase à part entière du cycle menstruel. C’est avant tout un signal que ton corps t’envoie pour indiquer qu’il existe un ou plusieurs déséquilibres qui méritent d’être explorés.",
    ],
    highlight: "Le SPM n’est pas une fatalité !",
  },

  explanation: {
    title: "Une période qui peut devenir plus confortable",
    paragraphs: [
      "La période prémenstruelle restera une phase particulière du cycle. Les fluctuations hormonales peuvent nous rendre plus sensibles, plus introspectives ou plus vulnérables.",
      "Mais il est possible de vivre cette période avec davantage de confort et de sérénité. Observer la temporalité et la forme de tes symptômes constitue déjà une première étape pour mieux comprendre ce que ton corps exprime.",
      "Les hormones ne fonctionnent jamais seules : leur équilibre peut aussi être influencé par ton hygiène de vie, ton environnement et ton vécu émotionnel.",
    ],
  },

  purpose: {
    title: "Pourquoi faire ce quiz ?",
    text: "Ce questionnaire a été conçu pour t’aider à mieux te situer et à mettre des mots sur ce que tu ressens.",
    items: [
      {
        title: "Identifier ton profil",
        text: "Découvre le profil de SPM qui semble le plus correspondre à ce que tu vis aujourd’hui.",
      },
      {
        title: "Comprendre tes signaux",
        text: "Observe ce que ton corps exprime dans la période prémenstruelle.",
      },
      {
        title: "Mieux cibler tes besoins",
        text: "Commence à repérer les pistes qui pourraient t’aider à retrouver plus de confort.",
      },
      {
        title: "Avancer avec douceur",
        text: "Le quiz n’est pas un diagnostic, mais un point de départ pour mieux te comprendre.",
      },
    ],
  },

  reassurance: {
    title: "Avant de commencer",
    items: [
      {
        icon: "clock",
        title: "Durée",
        text: "Le quiz prend environ 5 minutes.",
      },
      {
        icon: "heart",
        title: "Aucune bonne ou mauvaise réponse",
        text: "Réponds simplement selon ce que tu vis réellement.",
      },
      {
        icon: "lock",
        title: "Confidentialité",
        text: "Tes réponses servent uniquement à t’orienter vers le profil le plus adapté.",
      },
      {
        icon: "info",
        title: "À garder en tête",
        text: "Ce quiz ne remplace pas un suivi médical ou thérapeutique. Si tes symptômes dépassent la période prémenstruelle, ils peuvent avoir une autre origine.",
      },
    ],
  },

  start: {
    id: "quiz-start",
    title: "Prête à mieux comprendre ton corps ?",
    text: "Tu peux commencer le quiz dès maintenant. Prends un moment calme, réponds avec sincérité, et laisse-toi guider.",
    cta: {
      label: "Commencer le quiz",
      href: routes.quizQuestions,
    },
  },
};
