import { routes } from "../config/routes.config.js";

export const homeContent = {
  hero: {
    eyebrow: "Bien-être gyn'écologique · Gyn'écologie émotionnelle",
    title: "Sur le chemin du bien-être gyn'écologique",
    introduction: [
      "Tu souffres d’endométriose, du SOPK/SMOP, du syndrome prémenstruel, de douleurs de règles, de cystites ou de mycoses à répétition…",
      "Ou peut-être ressens-tu simplement une fatigue hormonale ou une charge émotionnelle liée à ton cycle.",
    ],
    highlight: "L’accompagnement que tu attendais est là.",
    conclusion:
      "De l’écoute, de la compréhension de tes douleurs, un soutien émotionnel et des outils pour t’aider à retrouver un apaisement de ton cycle menstruel.",
  },

  paths: {
    eyebrow: "Par où commencer ?",
    title: "3 chemins pour te guider",
    items: [
      {
        number: "01",
        title: "Explorer en autonomie",
        text: "Des outils pour commencer à observer ton cycle menstruel, comprendre tes symptômes émotionnels et physiques, et mieux connaître ton fonctionnement.",
        details: "Roue du Cycle · Profil de SPM · E-books",
        action: { label: "Explorer les ressources", to: "#premiers-pas" },
      },
      {
        number: "02",
        title: "Rejoindre La Clairière",
        text: "Un espace privé pour ne plus rester seule avec tes questionnements, échanger avec d’autres femmes et approfondir tes connaissances dans un cadre sécurisant.",
        details: "Forum · Ateliers · Ressources inédites",
        action: { label: "Découvrir le forum", to: "#forum" },
        featured: true,
      },
      {
        number: "03",
        title: "Être accompagnée",
        text: "Pour aller plus loin, comprendre ce que tes symptômes viennent mettre en lumière dans ton histoire et construire, pas à pas, des changements qui te correspondent.",
        details: "Coaching · Gynémotion · Fertilité",
        action: { label: "Voir les accompagnements", to: "#accompagnements" },
      },
    ],
  },

  firstSteps: {
    eyebrow: "Explorer en autonomie",
    title: "Tes premiers pas",
    introduction: "Toute transformation commence par une meilleure compréhension.",
    invitation: "Avant de vouloir changer ton cycle, apprends d’abord à le regarder autrement.",
    description:
      "Je mets régulièrement, et gratuitement, à ta disposition plusieurs ressources pour t’aider à développer ce nouveau regard.",
    accessInformation:
      "Tu peux découvrir librement les premières ressources. D’autres contenus viendront compléter ton chemin dans ton espace personnel.",
    conclusion: "Parce que comprendre précède toujours le changement.",
    items: [
      {
        label: "Le test éditorial",
        title: "Ton profil de Syndrome Prémenstruel",
        text: "Un test ludique et rapide pour découvrir la tendance de ton cycle, et obtenir des premières pistes pour aller mieux.",
        to: routes.quiz,
        tone: "quiz",
        preview: "quiz",
        access: "Accès libre",
      },
      {
        label: "Outil d’observation",
        title: "La Roue du Cycle Menstruel",
        text: "Un support concret pour te situer dans les 4 phases de ton cycle, et mieux te comprendre au quotidien.",
        to: routes.resources,
        tone: "cycle",
        preview: "cycle",
        access: "Accès libre",
      },
      {
        label: "À lire",
        title: "Les articles",
        text: "Des repères accessibles pour approfondir un sujet et développer un nouveau regard sur ton corps.",
        to: routes.resources,
        tone: "editorial",
        preview: "article",
        access: "Contenus publics et privés",
      },
      {
        label: "À regarder",
        title: "Les vidéos",
        text: "Des explications visuelles pour comprendre à ton rythme et revenir sur les notions essentielles.",
        to: routes.resources,
        tone: "editorial",
        preview: "video",
        access: "Contenus publics et privés",
      },
      {
        label: "À écouter",
        title: "Les podcasts",
        text: "Des échanges et des pistes de réflexion à écouter lorsque tu en as besoin.",
        to: routes.resources,
        tone: "editorial",
        preview: "podcast",
        access: "Contenus publics et privés",
      },
      {
        label: "La lettre de Mélanie",
        title: "La newsletter Gyn & Mots",
        text: "Des mots, des repères et de nouvelles ressources directement dans ta boîte mail.",
        to: routes.resources,
        tone: "newsletter",
        preview: "newsletter",
        access: "Accès libre",
      },
    ],
  },

  // Conservé pour le composant éditorial HomeQuiz et ses tests.
  // La nouvelle page d’accueil présente désormais ce contenu dans le carrousel.
  quiz: {
    eyebrow: "Le Quiz SPM",
    title: "Un quiz façon magazine, pensé pour mieux te comprendre.",
    description:
      "Réponds à quelques questions et découvre un portrait de ton vécu prémenstruel. Le résultat ouvre des pistes de réflexion, jamais un diagnostic.",
    benefits: [
      "Un parcours ludique et accessible",
      "Un résultat personnel à conserver dans ton espace",
      "Des ressources adaptées à ton profil",
    ],
    reassurance: "Tu restes libre de répondre, de faire une pause et de recommencer.",
    actions: {
      primary: { label: "Découvrir mon profil SPM", to: routes.quizQuestions },
      secondary: { label: "Comprendre le Quiz SPM", to: routes.quiz },
    },
    editorialLabel: "Le test éditorial",
    duration: "Quelques minutes",
    preview: {
      question: "Avant tes règles, comment évolue ton besoin de calme ?",
      answers: ["Il change peu", "Il devient plus présent", "J’ai besoin de m’isoler"],
      note: "Il n’y a pas de bonne ou de mauvaise réponse.",
    },
  },

  forum: {
    eyebrow: "Un espace privé et sécurisant",
    title: "La Clairière",
    introduction: [
      "Vivre avec des douleurs ou des symptômes gynécologiques peut nous faire sentir profondément seule.",
      "Parce qu’on n’est pas toujours écoutée, ni par les professionnels de santé, ni par son entourage.",
      "Parce qu’on aimerait comprendre ce qui nous arrive, poser des questions, explorer d’autres pistes… mais qu’on ne sait pas toujours où trouver un espace pour le faire.",
    ],
    highlight: "C’est de ce besoin qu’est née La Clairière.",
    text: "Un espace privé et sécurisant pour approfondir ta connaissance de ton cycle et de ton bien-être gynécologique, poser tes questions, partager ton expérience et avancer entourée de femmes qui vivent, elles aussi, leurs propres questionnements.",
    benefits: [
      {
        title: "Un espace safe",
        text: "Pour parler librement, poser tes questions et partager ton vécu sans jugement.",
      },
      {
        title: "Des contenus privés",
        text: "Pour approfondir la compréhension du cycle et de ton bien-être gynécologique.",
      },
      {
        title: "Des espaces de discussion",
        text: "Pour réfléchir, échanger et apprendre les unes des autres.",
      },
      {
        title: "Une communauté",
        text: "Parce que parfois, savoir que l’on n’est pas seule change déjà beaucoup de choses.",
      },
    ],
    action: { label: "Découvrir La Clairière", to: routes.platform },
  },

  melanie: {
    eyebrow: "Derrière La Clairière",
    title: "Je suis Mélanie, coach et accompagnante.",
    paragraphs: [
      "Pendant des années, j’ai cherché à comprendre mon propre corps et mes douleurs gynécologiques. Cette recherche m’a amenée à explorer mon cycle, mes émotions, mon mode de vie et les différentes dimensions de ma santé.",
      "Aujourd’hui, j’accompagne les femmes à faire ce même chemin : observer, comprendre, faire des liens et retrouver leur pouvoir pour agir selon leurs propres besoins.",
      "Mon approche est nourrie par mon parcours dans l’industrie, où j’ai travaillé pendant plus de dix ans comme chargée de projet. J’y ai appris à regarder un système dans sa globalité, à chercher les liens entre ses différentes parties et surtout, à ne jamais m’arrêter au premier symptôme visible.",
    ],
    highlight:
      "Aujourd’hui, mon terrain de travail a changé. Mon regard, lui, est toujours là, plus affûté que jamais !",
    action: { label: "Découvrir Mélanie", to: routes.vision },
  },

  accompaniments: {
    eyebrow: "Être accompagnée",
    title: "Parfois, observer ne suffit plus.",
    paragraphs: [
      "Ce n’est pas évident de prendre du recul seule, de faire des liens, de comprendre ce qui se joue en soi, et de mettre en place les changements que tu souhaites pour apaiser ta douleur ou ton problème gynécologique.",
      "Nous chercherons ensemble les relations entre les différents éléments de ta vie, les mécanismes, les ressources et les leviers de transformation qui te permettront de mieux comprendre ton fonctionnement, pour avancer sur ton propre chemin du bien-être gynécologique.",
    ],
    items: [
      {
        number: "01",
        labels: ["1 séance", "En visio ou présentiel"],
        title: "Séance individuelle",
        text: "Une séance unique, pour déposer ce que tu vis, clarifier ta situation et repartir avec des pistes concrètes.",
        ideal:
          "Idéal pour faire le point sur une problématique précise ou avant/après un accompagnement.",
        to: routes.accompanimentCoaching,
      },
      {
        number: "02",
        labels: ["6 mois", "En visio", "Suivi personnalisé"],
        title: "Chemin de traverse",
        text: "Un accompagnement pour explorer plus profondément les liens entre ton corps, ton cycle, tes émotions et ton histoire.",
        ideal:
          "Un parcours précieux pour une transformation profonde et durable, jusqu’à trouver paix et sérénité.",
        to: routes.accompanimentAine,
      },
      {
        number: "03",
        labels: ["Visio ou présentiel", "Gestion de ta fertilité"],
        title: "Gestion de la fertilité",
        text: "Un accompagnement pour apprendre à observer ton cycle grâce à la méthode symptothermique.",
        ideal:
          "Apprends à connaître ton cycle menstruel, pour une contraception naturelle, ou un projet bébé plus conscient.",
        to: routes.accompanimentSymptothermy,
      },
    ],
    action: { label: "Échanger avec Mélanie", to: routes.contact },
  },
};
