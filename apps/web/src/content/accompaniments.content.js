import { routes } from "../config/routes.config.js";

export const accompanimentOffers = {
  coaching: {
    slug: "seance-ponctuelle",
    eyebrow: "Faire le point",
    title: "Une séance pour retrouver de la clarté.",
    summary: "Un espace souple, sans engagement long, pour déposer une situation précise et regarder ce qui compte aujourd’hui.",
    duration: "1 h 15",
    price: "70 €",
    forWho: ["Tu traverses une situation confuse ou chargée.", "Tu souhaites prendre du recul avant une décision.", "Tu as besoin d’un temps d’écoute dédié."],
    exploration: ["Ton vécu et ce qui demande à être entendu.", "Les liens possibles entre ton contexte, ton cycle et ton ressenti.", "Une piste concrète pour poursuivre ton chemin."],
    process: ["Un temps pour atterrir et préciser ton besoin.", "Une exploration co-construite avec Mélanie.", "Une synthèse et des repères à emporter."],
  },
  aine: {
    slug: "aine",
    eyebrow: "Áine · Parcours en huit séances",
    title: "Avancer en profondeur, sans brusquer ton rythme.",
    summary: "Un parcours d’environ quatre mois pour explorer les liens entre ton vécu, tes émotions, ton cycle et ce que ton corps exprime.",
    duration: "1 bilan de 2 h · 7 suivis de 90 min",
    price: "830 € · paiement en 2 ou 3 fois",
    forWho: ["Tu souhaites consacrer du temps à un vécu gynécologique qui prend de la place.", "Tu recherches un cadre suivi et personnalisé.", "Tu es prêt·e à observer ce qui évolue entre les séances."],
    exploration: ["Une séance bilan pour poser les premières bases.", "Des pratiques choisies selon ton histoire et ton besoin.", "Des comptes-rendus pour garder une trace du chemin parcouru."],
    process: ["Huit séances espacées de deux à trois semaines.", "Un parcours d’environ quatre mois.", "Des échanges possibles entre les séances selon le cadre défini avec Mélanie."],
  },
  symptothermy: {
    slug: "symptothermie",
    eyebrow: "Comprendre ma fertilité",
    title: "Apprendre à observer son cycle avec méthode.",
    summary: "Un apprentissage progressif de la symptothermie pour la contraception, l’observation ou un projet de conception.",
    duration: "Durée adaptée à l’objectif",
    price: "À partir de 80 €",
    forWho: ["Tu souhaites mieux connaître ton cycle.", "Tu recherches une méthode d’observation rigoureuse.", "Tu veux être guidé·e selon un objectif de contraception, d’observation ou de conception."],
    exploration: ["Les signes observables du cycle.", "L’utilisation progressive de la méthode.", "L’interprétation accompagnée de tes observations."],
    process: ["Un rendez-vous de lancement.", "Des suivis répartis sur plusieurs cycles.", "Une validation adaptée au parcours choisi."],
    pricing: [
      { name: "Contraception", detail: "3 cycles d’observation, 12 cycles d’initiation puis validation", price: "450 €" },
      { name: "Observation", detail: "Lancement et 6 suivis", price: "160 €" },
      { name: "Conception · sécurité", detail: "Lancement, 3 suivis puis confirmation", price: "170 €" },
      { name: "Conception · soutien", detail: "Lancement et 1 suivi, puis parcours défini ensemble", price: "À partir de 80 €" },
    ],
    note: "Suivi ponctuel supplémentaire : 40 €. Séance de confirmation seule : 50 €.",
  },
};

export const accompanimentsContent = {
  hero: {
    eyebrow: "Les accompagnements",
    title: "Poursuivre le chemin avec Mélanie.",
    text: "Tu peux venir avec une question précise, un besoin d’exploration plus profond ou l’envie de mieux comprendre ta fertilité.",
  },
  choices: [
    { id: "coaching", title: "Faire le point", need: "J’ai besoin d’y voir plus clair sur une situation.", meta: "1 h 15 · 70 €", to: routes.accompanimentCoaching },
    { id: "aine", title: "Áine", need: "Je souhaite être accompagné·e dans la durée.", meta: "8 séances · 830 €", to: routes.accompanimentAine },
    { id: "symptothermy", title: "Comprendre ma fertilité", need: "Je veux apprendre à observer mon cycle.", meta: "Plusieurs parcours", to: routes.accompanimentSymptothermy },
  ],
  note: "Les accompagnements proposés par Mélanie ne remplacent pas un suivi médical. Ils offrent un espace complémentaire d’écoute, d’exploration et de transmission.",
};
