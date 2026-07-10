export const resourceTypes = {
  article: {
    id: "article",
    label: "Article",
    icon: "📖",
  },

  podcast: {
    id: "podcast",
    label: "Podcast",
    icon: "🎙️",
  },

  video: {
    id: "video",
    label: "Vidéo",
    icon: "🎥",
  },

  booklet: {
    id: "booklet",
    label: "Livret",
    icon: "📘",
  },
};

export const resourcesContent = {
  hero: {
    eyebrow: "Ressources",
    title: "Explorer les ressources de Mélanie",
    text: [
      "Articles, vidéos, podcasts et supports pédagogiques pour mieux comprendre ton corps, ton cycle et ton équilibre gynécologique.",
      "Chaque ressource est pensée comme une porte d’entrée douce vers plus de clarté, d’autonomie et de compréhension.",
    ],
  },

  filters: [
    {
      id: "all",
      label: "Toutes",
    },
    {
      id: "fertilite",
      label: "Fertilité",
    },
    {
      id: "gynecologie-emotionnelle",
      label: "Gyn’écologie émotionnelle",
    },
    {
      id: "podcast",
      label: "Podcast",
    },
    {
      id: "video",
      label: "Vidéo",
    },
    {
      id: "cycle",
      label: "Cycle",
    },
  ],

  resources: [
{
  id: "autonomie-fertilite",

  type: resourceTypes.article,

  title: "L’autonomie de la fertilité",

  description:
    "Découvre une méthode naturelle pour suivre ta fertilité, que ce soit en contraception, conception ou simplement pour mieux te connaître.",

  cover: "/images/resources/autonomie-fertilite.png",
  

  gallery: [
    {
      src: "/images/resources/autonomie-fertilite-1.png",
      alt: "Illustration 1 de l'article L'autonomie de la fertilité",
    },
    {
      src: "/images/resources/autonomie-fertilite-2.png",
      alt: "Illustration 2 de l'article L'autonomie de la fertilité",
    },
    {
      src: "/images/resources/autonomie-fertilite-3.png",
      alt: "Illustration 3 de l'article L'autonomie de la fertilité",
    },
    {
      src: "/images/resources/autonomie-fertilite-4.png",
      alt: "Illustration 4 de l'article L'autonomie de la fertilité",
    },
    {
      src: "/images/resources/autonomie-fertilite-5.png",
      alt: "Illustration 5 de l'article L'autonomie de la fertilité",
    },
  ],

  alt: "Illustration de l’article L’autonomie de la fertilité",

  url: "/resources/autonomie-fertilite",

  isExternal: false,

  ctaLabel: "Lire l’article",

  ctaIcon: "→",

  category: "Fertilité",

  categoryId: "fertilite",

  meta: "8 min",

  badge: {
    label: "Sélection Mélanie",
    variant: "primary",
  },

  body: [
    {
      type: "heading",
      content:
        "Prends le pouvoir : Découvre l’autonomie de la fertilité et la méthode de la Symptothermie",
    },

    {
      type: "paragraph",
      content:
        "L’autonomie de la fertilité et la pratique de la Symptothermie offrent un moyen puissant de prendre le contrôle de la santé reproductive. Découvre comment ces approches permettent de se connecter à son corps, de comprendre sa fertilité et de prendre des décisions éclairées.",
    },

    {
      type: "heading",
      content: "Une méthode holistique pour comprendre sa fertilité",
    },

    {
      type: "paragraph",
      content:
        "La Symptothermie est une méthode naturelle qui repose sur l’observation des signes de fertilité : température corporelle, glaire cervicale et autres indicateurs du cycle menstruel.",
    },

    {
      type: "heading",
      content: "Se réapproprier son corps",
    },

    {
      type: "paragraph",
      content:
        "En apprenant à reconnaître les signes de ton cycle, tu développes une meilleure compréhension de ta santé reproductive et tu peux faire des choix éclairés concernant la contraception ou la conception.",
    },

    {
      type: "heading",
      content: "Les avantages de la Symptothermie",
    },

    {
      type: "list",
      items: [
        "Méthode naturelle et respectueuse du corps.",
        "Efficacité comparable aux autres méthodes contraceptives lorsqu'elle est correctement appliquée.",
        "Meilleure connaissance de son cycle.",
        "Aide à la conception comme à la contraception.",
      ],
    },

    {
      type: "heading",
      content: "Choisir sa contraception",
    },

    {
      type: "paragraph",
      content:
        "Le choix d’une contraception dépend de nombreux critères : efficacité, innocuité, réversibilité, adaptabilité et coût.",
    },
  ],

  relatedResourceIds: [
    "gynecologie-emotionnelle",
    "podcast-cycle-feminin",
  ],
},

    {
      id: "gynecologie-emotionnelle",

      type: resourceTypes.article,

      title: "La gyn’écologie émotionnelle",

      description:
        "Explore le lien entre les émotions, le cycle menstruel et le bien-être gynécologique pour mieux comprendre ce qui se passe dans ton corps.",

      cover: "/images/resources/gynecologie-emotionnelle.png",

      alt: "Illustration de l’article La gyn’écologie émotionnelle",

      url: "/resources/gynecologie-emotionnelle",

      isExternal: false,

      ctaLabel: "Lire l’article",

      ctaIcon: "→",

      category: "Gyn’écologie émotionnelle",

      categoryId: "gynecologie-emotionnelle",

      meta: "5 min",

      badge: {
        label: "Sélection Mélanie",
        variant: "primary",
      },

      body: [
        {
          type: "paragraph",
          content:
            "La gyn’écologie émotionnelle explore le lien profond entre nos émotions et notre bien-être gynécologique.",
        },

        {
          type: "heading",
          content: "Comprendre la gyn’écologie émotionnelle",
        },

        {
          type: "paragraph",
          content:
            "Fondée sur les principes de Maud Renard, cette approche considère que les émotions influencent le cycle menstruel, les symptômes et certaines pathologies gynécologiques.",
        },

        {
          type: "heading",
          content: "Le pouvoir de la conscience émotionnelle",
        },

        {
          type: "paragraph",
          content:
            "Reconnaître et comprendre ses émotions permet d’identifier certains schémas qui peuvent avoir un impact sur le bien-être gynécologique.",
        },

        {
          type: "heading",
          content: "Explorer les émotions au fil du cycle",
        },

        {
          type: "paragraph",
          content:
            "Chaque phase du cycle menstruel est associée à des ressentis particuliers. Les observer permet de mieux comprendre son fonctionnement et d’accompagner son équilibre.",
        },

        {
          type: "heading",
          content: "La méthode Gyn’émotion®",
        },

        {
          type: "paragraph",
          content:
            "Cette méthode associe conscience émotionnelle, méditation et apaisement énergétique afin de favoriser un mieux-être global.",
        },

        {
          type: "heading",
          content: "Les bénéfices",
        },

        {
          type: "list",
          items: [
            "Réduction de certains symptômes.",
            "Meilleure gestion du stress.",
            "Compréhension plus fine de son cycle.",
            "Développement d'un équilibre émotionnel durable.",
          ],
        },
      ],
      relatedResourceIds: ["autonomie-fertilite", "video-cycle-feminin"],
    },

    {
      id: "podcast-cycle-feminin",
      type: resourceTypes.podcast,
      title: "Podcast — Ressource audio",
      description:
        "Un contenu audio pour approfondir la compréhension du cycle, du corps et de l’accompagnement proposé par Mélanie.",
      cover: "/images/resources/podcast-cycle-feminin.png",
      alt: "Illustration du podcast de Mélanie",
      url: "/resources/podcast-cycle-feminin",
      isExternal: false,
      externalUrl:
        "https://open.spotify.com/episode/6UKtGvTmILU8UBQKIWpxgz?si=f2a76dff63134b05&nd=1&dlsi=4311b5699a4b477e",
      ctaLabel: "Écouter directement sur Spotify",
      ctaIcon: "↗",
      category: "Podcast",
      categoryId: "podcast",
      meta: "À écouter",
      badge: null,
      relatedResourceIds: ["autonomie-fertilite", "gynecologie-emotionnelle"],

      embed: {
        type: "spotify",
        title: "Lecteur Spotify",
        src: "https://open.spotify.com/embed/episode/6UKtGvTmILU8UBQKIWpxgz?utm_source=generator&si=dcf533b6706c47b3",
      },

      body: [
        {
          type: "heading",
          content: "Écouter pour mieux comprendre son corps",
        },
        {
          type: "paragraph",
          content:
            "Ce podcast permet d’aborder les sujets liés au cycle, au corps et au bien-être gynécologique dans un format plus intime et accessible.",
        },
        {
          type: "paragraph",
          content:
            "Il peut être écouté à ton rythme, comme une ressource complémentaire aux articles pédagogiques proposés sur la plateforme.",
        },
      ],
    },

    {
      id: "video-cycle-feminin",
      type: resourceTypes.video,
      title: "Vidéo — Ressource pédagogique",
      description:
        "Une vidéo pour découvrir autrement les sujets liés au cycle, au corps et à l’équilibre gynécologique.",
      cover: "/images/resources/video-cycle-feminin.png",
      alt: "Illustration de la vidéo pédagogique de Mélanie",
      url: "/resources/video-cycle-feminin",
      isExternal: false,
      externalUrl: "https://www.youtube.com/watch?v=xgZOUuhl_3w",
      ctaLabel: "Voir directement sur YouTube",
      ctaIcon: "↗",
      category: "Vidéo",
      categoryId: "video",
      meta: "À regarder",
      badge: null,
      relatedResourceIds: ["autonomie-fertilite", "gynecologie-emotionnelle"],

      embed: {
        type: "youtube",
        title: "Lecteur YouTube",
        src: "https://www.youtube.com/embed/xgZOUuhl_3w",
      },

      body: [
        {
          type: "heading",
          content: "Découvrir la ressource en vidéo",
        },
        {
          type: "paragraph",
          content:
            "Cette vidéo propose une autre manière d’aborder les sujets liés au cycle, au corps et à l’équilibre gynécologique.",
        },
        {
          type: "paragraph",
          content:
            "Elle complète les articles et ressources écrites en apportant un format plus visuel et direct.",
        },
      ],
    },

    {
      id: "comprendre-son-cycle",
      type: resourceTypes.article,

      title: "Comprendre son cycle : physiologie et rythmes naturels",

      description:
        "Découvre les quatre phases du cycle menstruel, leur fonctionnement et les variations naturelles d’énergie et d’émotions qui les accompagnent.",

      cover: "/images/resources/comprendre-son-cycle.jpg",

      alt: "Illustration représentant les quatre phases du cycle menstruel",

      url: "/resources/comprendre-son-cycle",

      isExternal: false,

      ctaLabel: "Lire l'article",
      ctaIcon: "→",

      category: "Cycle",
      categoryId: "cycle",

      meta: "8 min",

      badge: "Observer son cycle",

      relatedResourceIds: [
        "pourquoi-suivre-son-cycle",
        "autonomie-fertilite",
        "podcast-cycle-feminin",
      ],

      body: [
        {
          type: "heading",
          content: "Le cycle est un rythme naturel",
        },

        {
          type: "paragraph",
          content:
            "Le cycle menstruel est un processus biologique gouverné par des variations hormonales qui influencent le corps, l'énergie et les émotions. Observer ces variations permet de mieux comprendre son fonctionnement et d'adapter son quotidien à ses besoins.",
        },

        {
          type: "heading",
          content: "La phase menstruelle : le temps du repos",
        },

        {
          type: "paragraph",
          content:
            "Les hormones chutent et l'utérus élimine naturellement la muqueuse utérine. Cette période invite souvent au ralentissement, au repos et à l'introspection.",
        },

        {
          type: "heading",
          content: "La phase folliculaire : le renouveau",
        },

        {
          type: "paragraph",
          content:
            "Les follicules se développent, les œstrogènes augmentent progressivement et l'énergie remonte. C'est souvent une période propice à la créativité, à la motivation et aux nouveaux projets.",
        },

        {
          type: "heading",
          content: "L'ovulation : l'épanouissement",
        },

        {
          type: "paragraph",
          content:
            "L'ovulation correspond au moment où l'ovocyte est libéré. De nombreuses femmes ressentent davantage de confiance, de dynamisme et d'aisance relationnelle durant cette phase.",
        },

        {
          type: "heading",
          content: "La phase lutéale : la transition intérieure",
        },

        {
          type: "paragraph",
          content:
            "Après l'ovulation, la progestérone prépare le corps à une éventuelle grossesse. L'énergie diminue progressivement et les besoins changent. Les observer permet de mieux respecter son rythme.",
        },

        {
          type: "heading",
          content: "Chaque femme possède son propre rythme",
        },

        {
          type: "paragraph",
          content:
            "Chaque cycle est unique. Observer les différentes phases avec bienveillance permet d'identifier son fonctionnement personnel plutôt que de chercher à correspondre à un modèle théorique.",
        },
      ],
      ebook: {
        title: "Observer son cycle",
        subtitle: "Une clef pour mieux se comprendre",
        chapter: "Chapitre 2 • Comprendre son cycle",
        available: false,
        ctaLabel: "Télécharger gratuitement l’e-book",
        url: "",
        cover: "/images/resources/ebook.png",
      },
    },

    {
      id: "pourquoi-suivre-son-cycle",

      type: resourceTypes.article,

      title: "Pourquoi suivre son cycle ?",

      description:
        "Découvre pourquoi observer ton cycle peut transformer ta compréhension de ton corps, de ton énergie et de ton bien-être gynécologique.",

      cover: "/images/resources/pourquoi-suivre-son-cycle.png",

      alt: "Illustration Pourquoi suivre son cycle",

      url: "/resources/pourquoi-suivre-son-cycle",

      isExternal: false,

      ctaLabel: "Lire l'article",

      ctaIcon: "→",

      category: "Cycle",

      categoryId: "cycle",

      meta: "9 min",

      badge: {
        label: "Observer son cycle",
        variant: "primary",
      },

      relatedResourceIds: [
        "comprendre-son-cycle",
        "symptothermie",
        "outils-observer-cycle",
      ],

      ebook: {
        cover: "/images/resources/ebook.png",
        title: "Observer son cycle",
        subtitle: "Une clef pour mieux se comprendre",
        chapter: "Chapitre 3 • Pourquoi suivre son cycle ?",
        available: false,
        ctaLabel: "Télécharger gratuitement l'e-book",
        url: "",
      },

      body: [
        {
          type: "heading",
          content: "Observer son cycle, c'est mieux se connaître",
        },

        {
          type: "paragraph",
          content:
            "Observer son cycle ne consiste pas uniquement à connaître la date de ses règles. C'est apprendre à écouter les messages de son corps et à comprendre son fonctionnement au quotidien.",
        },

        {
          type: "heading",
          content: "Identifier sa phase du cycle",
        },

        {
          type: "paragraph",
          content:
            "Connaître sa phase permet de mieux comprendre son énergie, ses émotions et d'adapter son rythme de vie.",
        },

        {
          type: "heading",
          content: "Confirmer une ovulation",
        },

        {
          type: "paragraph",
          content:
            "L'observation permet de vérifier qu'une ovulation a bien eu lieu et d'obtenir des informations précieuses sur l'équilibre hormonal.",
        },

        {
          type: "heading",
          content: "Repérer ses symptômes",
        },

        {
          type: "paragraph",
          content:
            "Fatigue, douleurs, humeur ou digestion peuvent être observées afin de mieux comprendre leur évolution d'un cycle à l'autre.",
        },

        {
          type: "heading",
          content: "Créer un équilibre durable",
        },

        {
          type: "paragraph",
          content:
            "Observer son cycle permet progressivement d'adapter son hygiène de vie et de favoriser un meilleur équilibre gynécologique.",
        },
      ],
    },

    {
      id: "symptothermie",

      type: resourceTypes.article,

      title: "Découvrir la méthode symptothermique",

      description:
        "Comprends le fonctionnement de la méthode symptothermique et découvre pourquoi elle est reconnue comme une méthode fiable d'observation du cycle.",

      cover: "/images/resources/symptothermie.jpg",

      alt: "Illustration méthode symptothermique",

      url: "/resources/symptothermie",

      isExternal: false,

      ctaLabel: "Lire l'article",

      ctaIcon: "→",

      category: "Fertilité",

      categoryId: "fertilite",

      meta: "10 min",

      badge: {
        label: "Observer son cycle",
        variant: "primary",
      },

      relatedResourceIds: [
        "comprendre-son-cycle",
        "autonomie-fertilite",
        "pourquoi-suivre-son-cycle",
      ],

      ebook: {
        cover: "/images/resources/ebook.png",
        title: "Observer son cycle",
        subtitle: "Une clef pour mieux se comprendre",
        chapter: "Chapitre 4 • La méthode symptothermique",
        available: false,
        ctaLabel: "Télécharger gratuitement l'e-book",
        url: "",
      },

      body: [
        {
          type: "heading",
          content: "Une méthode naturelle d'observation",
        },

        {
          type: "paragraph",
          content:
            "La méthode symptothermique repose sur l'observation de plusieurs indicateurs physiologiques afin de comprendre précisément son cycle.",
        },

        {
          type: "heading",
          content: "Les deux observations principales",
        },

        {
          type: "list",
          items: ["La température basale", "La glaire cervicale"],
        },

        {
          type: "heading",
          content: "Trois grands objectifs",
        },

        {
          type: "list",
          items: [
            "Contraception naturelle",
            "Projet bébé",
            "Observation de son équilibre hormonal",
          ],
        },

        {
          type: "heading",
          content: "Pourquoi être accompagnée ?",
        },

        {
          type: "paragraph",
          content:
            "L'apprentissage de cette méthode nécessite des bases solides afin d'interpréter correctement les observations et gagner progressivement en autonomie.",
        },
      ],
    },

    {
      id: "outils-observer-cycle",

      type: resourceTypes.article,

      title: "Les outils pour observer son cycle",

      description:
        "Découvre différents outils pour noter tes observations et suivre ton cycle au quotidien.",

      cover: "/images/resources/outils-observer-cycle.png",

      alt: "Illustration outils de suivi du cycle",

      url: "/resources/outils-observer-cycle",

      isExternal: false,

      ctaLabel: "Lire l'article",

      ctaIcon: "→",

      category: "Cycle",

      categoryId: "cycle",

      meta: "6 min",

      badge: {
        label: "Observer son cycle",
        variant: "primary",
      },

      relatedResourceIds: [
        "comprendre-son-cycle",
        "pourquoi-suivre-son-cycle",
        "symptothermie",
      ],

      ebook: {
        cover: "/images/resources/ebook.png",
        title: "Observer son cycle",
        subtitle: "Une clef pour mieux se comprendre",
        chapter: "Chapitre 5 • Les outils pour suivre son cycle",
        available: false,
        ctaLabel: "Télécharger gratuitement l'e-book",
        url: "",
      },

      body: [
        {
          type: "heading",
          content: "La fleur de cycle",
        },

        {
          type: "paragraph",
          content:
            "La fleur de cycle permet de représenter visuellement les observations réalisées chaque jour sous une forme créative et facile à relire.",
        },

        {
          type: "heading",
          content: "Les applications mobiles",
        },

        {
          type: "paragraph",
          content:
            "Les applications peuvent servir de carnet d'observation, mais elles ne remplacent jamais l'analyse personnelle du cycle.",
        },

        {
          type: "heading",
          content: "Le carnet de suivi",
        },

        {
          type: "paragraph",
          content:
            "Tenir un carnet ou un tableau permet de mettre en évidence les évolutions du cycle, les symptômes et les liens avec son mode de vie.",
        },
      ],
    },
  ],
};
