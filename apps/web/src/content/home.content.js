import { resourceIcons } from "./icons.content.js";
import cycleImage from "../assets/images/resource-cycle.jpg";
import podcastImage from "../assets/images/resource-podcast.png";
import videoImage from "../assets/images/resource-video.jpg";
export const homeContent = {
  hero: {
    eyebrow: "Bien-être gynécologique • Gyn'écologie émotionnelle",

    title: "Sur le chemin du bien-être gynécologique",

    introduction: [
      "Tu souffres d’endométriose, du SOPK/SMOP, du syndrome prémenstruel, de douleurs de règles, de cystites ou de mycoses à répétition…",
      "Ou peut-être ressens-tu simplement une fatigue hormonale ou une charge émotionnelle liée à ton cycle.",
    ],

    mission: "L’accompagnement que tu attendais est là.",

    description:
      "De l’écoute, de la compréhension de tes douleurs, un soutien émotionnel et des outils pour t’aider à retrouver un apaisement de ton cycle menstruel.",

    actions: {
      primary: {
        label: "Prendre rendez-vous",
        to: "/contact",
      },

      secondary: {
        label: "Faire le quiz SPM",
        to: "/quiz",
      },
    },
  },
  accompaniments: {
    eyebrow: "J’accompagne",

    title:
      "Les femmes à mieux comprendre leur corps, leur cycle et leurs émotions",

    description:
      "Chaque parcours est différent. Que tu vives avec des douleurs, un syndrome prémenstruel difficile, une pathologie gynécologique ou un questionnement autour de ta fertilité, l’objectif est de t’aider à retrouver de la clarté, de l’apaisement et de l’autonomie.",

    items: [
      {
        icon: "🌿",
        title: "Douleurs gynécologiques",
        description:
          "Endométriose, SOPK/SMOP, douleurs de règles, dyspareunies, cystites ou mycoses à répétition.",
        link: {
          label: "Comprendre cet accompagnement",
          to: "/accompagnements",
        },
      },
      {
        icon: "🌙",
        title: "Cycle et syndrome prémenstruel",
        description:
          "Mieux comprendre tes variations hormonales, tes émotions, ta fatigue ou les signes que ton corps t’envoie.",
        link: {
          label: "Explorer cette approche",
          to: "/accompagnements",
        },
      },
      {
        icon: "🌸",
        title: "Fertilité naturelle",
        description:
          "Découvrir ton cycle menstruel, observer tes signes de fertilité et avancer vers une contraception naturelle ou un projet bébé.",
        link: {
          label: "Découvrir la fertilité physiologique",
          to: "/accompagnements",
        },
      },
      {
        icon: "🤍",
        title: "Gyn’écologie émotionnelle",
        description:
          "Relier le corps, les émotions et le vécu pour comprendre ce qui se joue derrière certains déséquilibres.",
        link: {
          label: "Découvrir l’approche",
          to: "/accompagnements",
        },
      },
    ],
  },
  quiz: {
    eyebrow: "Première étape",

    title: "Découvre ton profil de SPM",

    description:
      "Le quiz t’aide à mieux comprendre ce que tu vis avant tes règles et t’oriente vers les premières ressources adaptées à ton profil.",

    benefits: [
      "Identifier ton profil dominant.",
      "Mettre des mots sur tes ressentis.",
      "Recevoir des premières pistes d’apaisement.",
    ],

    reassurance:
      "Ce quiz ne remplace pas un avis médical. Il est conçu pour t’aider à mieux comprendre ton cycle et à avancer à ton rythme.",

    actions: {
      primary: {
        label: "Faire le quiz",
        to: "/quiz",
      },

      secondary: {
        label: "Découvrir les ressources",
        to: "/resources",
      },
    },
  },
  about: {
    eyebrow: "Qui suis-je ?",

    title: "Je suis Mélanie, accompagnante en bien-être gynécologique.",

    introduction: [
      "Mon parcours est né d'une histoire personnelle. Comme beaucoup de femmes, j'ai dû apprendre à écouter mon corps, comprendre ses messages et chercher des réponses parfois difficiles à trouver.",
      "Aujourd'hui, j'accompagne celles qui souhaitent mieux comprendre leur cycle, retrouver de l'apaisement et avancer avec davantage de confiance.",
    ],

    mission:
      "Je crois profondément que comprendre son corps est une première étape vers l'autonomie.",

    vision:
      "Mon rôle n'est pas d'apporter toutes les réponses, mais de te transmettre les connaissances et les outils qui te permettront d'avancer à ton rythme.",

    quote: "Ton corps ne te trahit pas. Il cherche simplement à te parler.",

    action: {
      label: "Découvrir mon parcours",
      to: "/about",
    },
  },
  approach: {
    eyebrow: "Ma méthode",

    title: "Une approche qui relie le corps, les émotions et le vécu",

    description:
      "La philosophie GYNECE repose sur une conviction simple : ton corps ne parle jamais contre toi. Il exprime une histoire, des besoins, des tensions ou des déséquilibres qu’il devient possible d’écouter autrement.",

    pillars: [
      {
        icon: "🌿",
        title: "Écouter le corps",
        description:
          "Accueillir les symptômes comme des signaux à comprendre, sans culpabiliser ni minimiser ce que tu ressens.",
      },
      {
        icon: "💫",
        title: "Relier les émotions et le vécu",
        description:
          "Explorer les liens possibles entre ton histoire, tes ressentis, ton cycle et certains déséquilibres gynécologiques.",
      },
      {
        icon: "🧭",
        title: "Transmettre des outils concrets",
        description:
          "Te donner des repères simples pour mieux comprendre ton cycle, tes besoins et les messages de ton corps.",
      },
      {
        icon: "🤍",
        title: "Avancer à ton rythme",
        description:
          "Respecter ton parcours, tes limites et ton autonomie, sans pression ni solution toute faite.",
      },
    ],

    benefits: [
      "Mieux comprendre ce que tu vis.",
      "Retrouver de la clarté.",
      "Te sentir écoutée et respectée.",
      "Avancer avec plus de confiance.",
    ],

    action: {
      label: "Découvrir l’approche de Mélanie",
      to: "/about",
    },
  },
  values: {
    eyebrow: "Mes valeurs",

    title: "Les valeurs qui guident chacun de mes accompagnements",

    description:
      "Au-delà des outils et des méthodes, je souhaite offrir un espace où chaque femme peut se sentir accueillie, écoutée et libre d'avancer à son propre rythme.",

    quote:
      "Chaque femme mérite d'être écoutée avec douceur, respect et sans jugement.",

    items: [
      {
        icon: "🤍",
        title: "Respect & Bienveillance",
        description:
          "Accueillir chaque histoire avec douceur, sans jugement et dans le respect du parcours de chacune.",
      },

      {
        icon: "🌿",
        title: "Autonomie",
        description:
          "Transmettre des connaissances pour que tu puisses mieux comprendre ton corps et devenir actrice de ton bien-être.",
      },

      {
        icon: "✨",
        title: "Empowerment",
        description:
          "Retrouver confiance dans ton corps, tes ressentis et ta capacité à faire des choix éclairés.",
      },

      {
        icon: "🌸",
        title: "Transmission",
        description:
          "Partager des outils simples, accessibles et concrets pour accompagner ton cheminement durablement.",
      },

      {
        icon: "🌍",
        title: "Justice & Inclusion",
        description:
          "Offrir un accompagnement accessible, respectueux des singularités et ouvert à chaque parcours de vie.",
      },
    ],
  },
  problems: {
    eyebrow: "Tu te reconnais ?",

    title: "Les situations que Mélanie accompagne",

    description:
      "Chaque symptôme raconte quelque chose. Si l’une de ces situations te parle, tu peux commencer par explorer les ressources ou faire le quiz pour mieux te situer.",

    items: [
      {
        slug: "douleurs-gynecologiques",
        icon: "🌿",
        title: "Douleurs gynécologiques",
        symptoms: [
          "Douleurs de règles intenses",
          "Douleurs pelviennes",
          "Inconfort récurrent",
        ],
        actions: {
          resource: {
            label: "Voir les ressources",
            to: "/resources",
          },
          quiz: {
            label: "Faire le quiz",
            to: "/quiz",
          },
        },
      },
      {
        slug: "spm-difficile",
        icon: "🌙",
        title: "SPM difficile",
        symptoms: [
          "Émotions fortes avant les règles",
          "Irritabilité ou tristesse",
          "Sensation d’être dépassée",
        ],
        actions: {
          resource: {
            label: "Voir les ressources",
            to: "/resources",
          },
          quiz: {
            label: "Faire le quiz",
            to: "/quiz",
          },
        },
      },
      {
        slug: "endometriose-sopk",
        icon: "🌸",
        title: "Endométriose / SOPK",
        symptoms: [
          "Diagnostic ou suspicion",
          "Fatigue chronique",
          "Besoin de comprendre ce que ton corps traverse",
        ],
        actions: {
          resource: {
            label: "Voir les ressources",
            to: "/resources",
          },
          quiz: {
            label: "Faire le quiz",
            to: "/quiz",
          },
        },
      },
      {
        slug: "inconforts-intimes",
        icon: "🤍",
        title: "Cystites, mycoses, inconforts intimes",
        symptoms: [
          "Infections à répétition",
          "Gêne intime",
          "Besoin de retrouver de l’apaisement",
        ],
        actions: {
          resource: {
            label: "Voir les ressources",
            to: "/resources",
          },
          quiz: {
            label: "Faire le quiz",
            to: "/quiz",
          },
        },
      },
      {
        slug: "dyspareunies",
        icon: "💫",
        title: "Douleurs pendant les rapports",
        symptoms: [
          "Rapports douloureux",
          "Blocages ou tensions",
          "Difficulté à en parler librement",
        ],
        actions: {
          resource: {
            label: "Voir les ressources",
            to: "/resources",
          },
          quiz: {
            label: "Faire le quiz",
            to: "/quiz",
          },
        },
      },
      {
        slug: "fatigue-hormonale-emotions",
        icon: "🧭",
        title: "Fatigue hormonale & émotions",
        symptoms: [
          "Épuisement cyclique",
          "Charge émotionnelle",
          "Impression de ne plus comprendre ton corps",
        ],
        actions: {
          resource: {
            label: "Voir les ressources",
            to: "/resources",
          },
          quiz: {
            label: "Faire le quiz",
            to: "/quiz",
          },
        },
      },
    ],
  },
  personalized: {
    eyebrow: "Un accompagnement unique",

    title: "Parce que ton histoire ne se résume pas à une étiquette.",

    description: [
      "Deux femmes vivant la même problématique peuvent avoir des parcours, des ressentis et des besoins très différents.",
      "C'est pourquoi je ne propose pas de solution toute faite. Chaque accompagnement s'adapte à ton histoire, ton rythme et ce que tu traverses aujourd'hui.",
    ],

    points: [
      {
        icon: "🌱",
        title: "Ton histoire compte",
        description:
          "Ton vécu est unique et mérite d'être accueilli avec attention.",
      },
      {
        icon: "🤍",
        title: "Ton rythme est respecté",
        description:
          "Chaque étape se construit progressivement, sans pression ni jugement.",
      },
      {
        icon: "🧭",
        title: "L'accompagnement s'adapte",
        description:
          "Les outils proposés évoluent en fonction de tes besoins et de ton cheminement.",
      },
    ],

    futureNote:
      "Demain, ton parcours pourra être encore plus personnalisé grâce au quiz GYNECE.",
  },
  testimonials: {
    eyebrow: "Elles en parlent",

    title:
      "Chaque parcours est unique, mais toutes ont retrouvé un peu plus de sérénité.",

    description:
      "Ces témoignages sont provisoires et seront remplacés par les retours authentiques des femmes accompagnées par Mélanie.",

    note: "⚠️ Témoignages provisoires destinés à la phase de développement.",

    items: [
      {
        id: 1,
        name: "Prénom à venir",
        context: "Accompagnement personnalisé",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ce témoignage sera remplacé par un retour authentique d'une femme accompagnée.",
        image: null,
        status: "published",
        order: 1,
      },

      {
        id: 2,
        name: "Prénom à venir",
        context: "Gestion du cycle",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ce témoignage est uniquement présent afin de construire l'interface.",
        image: null,
        status: "published",
        order: 2,
      },

      {
        id: 3,
        name: "Prénom à venir",
        context: "Endométriose",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Il sera remplacé par un véritable retour d'expérience.",
        image: null,
        status: "published",
        order: 3,
      },
    ],
  },
  resources: {
    eyebrow: "Ressources gratuites",

    title: "Commencer à comprendre, sans engagement",

    description:
      "Articles, podcasts, vidéos ou outils pratiques : ces ressources sont là pour t’aider à poser des premiers mots sur ce que tu vis, à ton rythme.",

    items: [
      {
        id: 1,
        title: "Comprendre ton cycle",
        slug: "comprendre-ton-cycle",
        type: {
          id: "article",
          label: "Article",
          icon: resourceIcons.article,
        },
        image: {
          src: cycleImage,
          alt: "Illustration autour du cycle menstruel",
        },
        category: "Cycle menstruel",
        description:
          "Un contenu pédagogique pour mieux comprendre les grandes phases de ton cycle et ce qu’elles peuvent révéler.",
        mediaUrl: null,
        isPublished: true,
        order: 1,
        createdAt: "2026-06-18",
        publishedAt: "2026-07-08",
        isNew: true,
        cta: {
          label: "Lire l’article",
          to: "/resources/comprendre-ton-cycle",
        },
      },
      {
        id: 2,
        title: "Gyn’écologie émotionnelle",
        slug: "gynecologie-emotionnelle-podcast",
        type: {
          id: "podcast",
          label: "Podcast",
          icon: resourceIcons.podcast,
        },
        image: {
          src: podcastImage,
          alt: "Illustration podcast autour de la gynécologie émotionnelle",
        },
        category: "Approche",
        description:
          "Un épisode pour découvrir le parcours de résilience face à l'endométriose de Mélanie et nous fait découvrir le cycle féminin sous le prisme des émotions.",
        mediaUrl: null,
        isPublished: true,
        order: 2,
        createdAt: "2026-06-12",
        publishedAt: "2026-07-05",
        isNew: true,
        cta: {
          label: "Écouter l’épisode",
          to: "https://open.spotify.com/episode/6UKtGvTmILU8UBQKIWpxgz?si=BpPvBUMGRhC6Yuqaa5ViJg",
        },
      },
      {
        id: 3,
        title: "Vaincre l’endométriose",
        slug: "vaincre-endometriose-video",
        type: {
          id: "video",
          label: "Vidéo",
          icon: resourceIcons.video,
        },
        image: {
          src: videoImage,
          alt: "Illustration vidéo autour de l’endométriose",
        },
        category: "Endométriose",
        description:
          "Une vidéo pour découvrir le témoignage de Mélanie et sa victoire face à l’endométriose.",
        mediaUrl: null,
        isPublished: true,
        order: 3,
        createdAt: "2026-06-05",
        publishedAt: "2026-07-01",
        isNew: false,
        cta: {
          label: "Voir la vidéo",
          to: "https://youtu.be/xgZOUuhl_3w?si=exARE3tIvLzTJqWY",
        },
      },
      {
        id: 4,
        title: "La roue du cycle",
        slug: "roue-du-cycle",
        type: {
          id: "tool",
          label: "Outil gratuit",
          icon: resourceIcons.tool,
        },
        image: {
          src: cycleImage,
          alt: "Illustration autour du cycle menstruel",
        },
        category: "Outil",
        description:
          "Un support visuel pour mieux repérer les différentes phases du cycle et adapter ton quotidien.",
        mediaUrl: null,
        isPublished: true,
        order: 4,
        createdAt: "2026-05-20",
        publishedAt: "2026-06-24",
        isNew: false,
        cta: {
          label: "Découvrir l’outil",
          to: "/resources/roue-du-cycle",
        },
      },
    ],

    action: {
      label: "Explorer toutes les ressources",
      to: "/resources",
    },
  },
  latestResources: {
    eyebrow: "Dernières publications",

    title: "Les derniers contenus publiés",

    description:
      "Découvre les ressources les plus récentes publiées par Mélanie pour continuer à mieux comprendre ton corps et ton cycle.",

    limit: 3,

    action: {
      label: "Voir toutes les ressources",
      to: "/resources",
    },
  },
  offers: {
    eyebrow: "Accompagnements",

    title: "Des solutions concrètes pour avancer avec plus de clarté",

    description:
      "Selon ton besoin, Mélanie propose différents formats d’accompagnement pour t’aider à mieux comprendre ton corps, ton cycle et ton vécu émotionnel.",

    items: [
      {
        id: 1,
        title: "Séance individuelle",
        slug: "seance-individuelle",
        shortDescription:
          "Un espace ponctuel pour déposer ce que tu vis, clarifier ta situation et repartir avec des pistes concrètes.",
        benefit: "Idéal pour faire le point sur une problématique précise.",
        duration: "1 séance",
        format: "En visio ou présentiel",
        price: null,
        isPublished: true,
        order: 1,
        cta: {
          label: "Découvrir",
          to: "/accompagnements",
        },
      },
      {
        id: 2,
        title: "Accompagnement sur plusieurs séances",
        slug: "accompagnement-plusieurs-seances",
        shortDescription:
          "Un accompagnement progressif pour explorer plus profondément les liens entre ton corps, ton cycle, tes émotions et ton histoire.",
        benefit:
          "Idéal pour avancer dans la durée et créer un vrai changement.",
        duration: "Forfait 8 séances",
        format: "Suivi personnalisé",
        price: null,
        isPublished: true,
        order: 2,
        cta: {
          label: "Découvrir",
          to: "/accompagnements",
        },
      },
      {
        id: 3,
        title: "Gestion naturelle de la fertilité",
        slug: "gestion-naturelle-fertilite",
        shortDescription:
          "Un accompagnement pour apprendre à observer ton cycle grâce à la méthode symptothermique.",
        benefit:
          "Idéal pour une contraception naturelle ou un projet bébé plus conscient.",
        duration: "Selon ton besoin",
        format: "Apprentissage guidé",
        price: null,
        isPublished: true,
        order: 3,
        cta: {
          label: "Découvrir",
          to: "/accompagnements",
        },
      },
    ],

    action: {
      label: "Voir tous les accompagnements",
      to: "/accompagnements",
    },
  },
  vision: {
    eyebrow: "Ma vision",

    title:
      "Créer un espace où chaque femme peut enfin mieux comprendre son corps.",

    description: [
      "Pendant longtemps, les douleurs, les émotions ou les déséquilibres féminins ont été considérés comme une fatalité. Pourtant, comprendre son corps change profondément la manière de le vivre.",
      "À travers cette plateforme, je souhaite transmettre des connaissances, des outils et un regard différent pour que chaque femme puisse devenir progressivement actrice de son bien-être.",
    ],

    convictions: [
      {
        icon: "🌿",
        title: "Comprendre avant d'agir",
        description:
          "La connaissance permet de faire des choix plus éclairés et plus sereins.",
      },
      {
        icon: "🤍",
        title: "Faire confiance à son corps",
        description:
          "Le corps n'est pas un ennemi. Il exprime des besoins qu'il est possible d'apprendre à écouter.",
      },
      {
        icon: "✨",
        title: "Retrouver son autonomie",
        description:
          "Mon objectif est que chaque femme reparte avec davantage de clés que de dépendance.",
      },
    ],

    quote:
      "Je veux créer un environnement dans lequel une transformation devient possible",

    action: {
      label: "Découvrir mon histoire",
      to: "/about",
    },
  },
  contactOptions: {
    eyebrow: "Premier contact",

    title: "Et si nous échangions ?",

    description:
      "Tu n'as pas besoin d'avoir toutes les réponses avant de me contacter. Que tu aies une question, une hésitation ou simplement l'envie d'en savoir plus, je serai ravie d'échanger avec toi.",

    items: [
      {
        id: 1,
        icon: "📩",
        title: "Formulaire de contact",
        description:
          "Tu souhaites me poser une question ou échanger avant de prendre rendez-vous ? Le formulaire est là pour ça.",
        href: "/contact",
        external: false,
        isEnabled: true,
        order: 1,
        cta: "Accéder au formulaire",
      },

      {
        id: 2,
        icon: "💌",
        title: "Par e-mail",
        description:
          "Tu préfères utiliser ton logiciel de messagerie ? Tu peux également m'écrire directement.",
        href: "mailto:contact@melaniedizet.com",
        external: true,
        isEnabled: true,
        order: 2,
        cta: "Envoyer un e-mail",
      },

      {
        id: 3,
        icon: "📍",
        title: "En présentiel",
        description:
          "Je t'accueille au Centre Périsanté de Nivelles pour les consultations en présentiel.",
        href: "/contact",
        external: false,
        isEnabled: true,
        order: 3,
        cta: "Prendre rendez-vous",
      },
    ],

    action: {
      label: "Prendre un premier contact",
      to: "/contact",
    },
  },
  recommendedResources: {
    eyebrow: "Pour bien commencer",

    title: "Par où commencer ?",

    description:
      "Si tu découvres l’univers de Mélanie, voici les premiers contenus que je te recommande pour avancer simplement.",

    items: [
      {
        id: 1,
        resourceSlug: "comprendre-ton-cycle",
        label: "Pour commencer",
        type: {
          id: "article",
          label: "Article",
          icon: "📄",
        },
        image: {
          src: cycleImage,
          alt: "Illustration autour du cycle menstruel",
        },
        reason:
          "Parce que comprendre ton cycle est souvent la première étape pour mieux comprendre ton corps.",
        order: 1,
        isActive: true,
      },
      {
        id: 2,
        resourceSlug: "gynecologie-emotionnelle-podcast",
        label: "À écouter",
        type: {
          id: "podcast",
          label: "Podcast",
          icon: "🎧",
        },
        image: {
          src: podcastImage,
          alt: "Illustration podcast autour de la gynécologie émotionnelle",
        },
        reason:
          "Pour découvrir la manière dont Mélanie relie le corps, les émotions et le vécu.",
        order: 2,
        isActive: true,
      },
      {
        id: 3,
        resourceSlug: null,
        label: "Pour te situer",
        type: {
          id: "quiz",
          label: "Quiz",
          icon: "📝",
        },
        image: {
          src: cycleImage,
          alt: "Illustration autour du cycle menstruel",
        },
        reason:
          "Le quiz t’aide à identifier les premières pistes adaptées à ce que tu vis.",
        order: 3,
        isActive: true,
        customContent: {
          title: "Faire le quiz SPM",

          type: {
            id: "quiz",
            label: "Quiz",
            icon: resourceIcons.quiz,
          },

          description:
            "Un premier pas simple pour mieux comprendre ton profil et recevoir des pistes adaptées.",

          cta: {
            label: "Faire le quiz",
            to: "/quiz",
          },
        },
      },
    ],
  },
  resourcesCarousel: {
    eyebrow: "Ressources",

    title: "Quelques contenus pour commencer",

    description:
      "Une sélection courte pour découvrir l’univers de Mélanie à travers un article, un podcast et une vidéo.",

    resourceSlugs: [
      "comprendre-ton-cycle",
      "gynecologie-emotionnelle-podcast",
      "apaiser-endometriose-video",
    ],

    autoplayDelay: 5000,

    action: {
      label: "Explorer toutes les ressources",
      to: "/resources",
    },
  },
};
