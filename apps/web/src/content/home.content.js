import { routes } from "../config/routes.config.js";

export const homeContent = {
  hero: {
    eyebrow: "La Clairière · Bien-être gynécologique",
    title: "Tu n’as pas à tout comprendre seule.",
    introduction:
      "La Clairière est une pause pour mettre des mots sur ce que tu traverses, trouver des repères et poursuivre ton chemin à ton rythme.",
    primary: { label: "Créer gratuitement mon espace", to: routes.registration },
    secondary: { label: "Découvrir La Clairière", to: routes.platform },
  },
  recognition: {
    eyebrow: "Là où tu en es",
    title: "Certains ressentis prennent parfois toute la place.",
    paragraphs: [
      "Peut-être que ton cycle influence ton énergie, tes émotions ou ton quotidien plus que tu ne le voudrais.",
      "Peut-être aussi que tu cherches simplement un endroit où ton vécu sera entendu, sans devoir tout expliquer ni tout savoir.",
    ],
    reassurance: "Ici, tu peux commencer par une question, un ressenti ou une simple curiosité.",
  },
  pause: {
    eyebrow: "Faire une pause",
    title: "Une clairière au milieu du chemin.",
    text:
      "Comme au cours d’une randonnée, La Clairière est un endroit où l’on s’arrête pour respirer, observer ce qui nous entoure et choisir la suite. Tu y avances sans pression, avec des repères adaptés à ton vécu.",
  },
  experiences: {
    eyebrow: "Dans La Clairière",
    title: "Commence par la porte qui te ressemble aujourd’hui.",
    items: [
      { symbol: "01", title: "Mieux me comprendre", text: "Un Quiz SPM ludique pour poser de premiers mots, sans jamais établir de diagnostic.", label: "Faire le Quiz SPM", to: routes.quiz },
      { symbol: "02", title: "Trouver mes repères", text: "Des ressources choisies selon ton profil et accessibles quand tu en as besoin.", label: "Explorer les ressources", to: routes.resources },
      { symbol: "03", title: "Ne plus avancer seule", text: "Le Cercle, un espace confidentiel où chaque membre s’exprime sous pseudonyme.", label: "Découvrir Le Cercle", to: routes.community },
      { symbol: "04", title: "Vivre un temps collectif", text: "Des webinaires pour écouter, comprendre et poser tes questions.", label: "Voir les webinaires", to: routes.webinars },
    ],
  },
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
  melanie: {
    eyebrow: "Derrière La Clairière",
    title: "Je suis Mélanie, coach et accompagnante.",
    text:
      "Mon propre chemin m’a appris combien il peut être difficile de trouver une écoute juste et des explications qui donnent du sens. J’ai créé La Clairière pour que chacun·e puisse disposer d’un premier espace de respiration avant, peut-être, d’aller plus loin.",
    details:
      "Formée au coaching, à la gyn’écologie émotionnelle, à la symptothermie et à l’éducation menstruelle, je relie l’écoute, la transmission et le respect de ton rythme.",
    label: "Découvrir mon parcours", to: routes.vision,
  },
  accompaniments: {
    eyebrow: "Poursuivre ensemble",
    title: "Parfois, quelques repères suffisent. Parfois, on souhaite être accompagné·e.",
    text:
      "Trois formats permettent d’aller plus loin avec Mélanie, selon ton besoin du moment et le rythme que tu souhaites donner à ton chemin.",
    items: [
      { title: "Faire le point", meta: "1 h 15 · 70 €", text: "Une séance ponctuelle pour déposer une situation et retrouver de la clarté.", to: routes.accompanimentCoaching },
      { title: "Áine", meta: "8 séances · 830 €", text: "Un parcours de quatre mois pour explorer plus profondément ton vécu gynécologique.", to: routes.accompanimentAine },
      { title: "Comprendre ma fertilité", meta: "Plusieurs parcours", text: "Un apprentissage progressif de la symptothermie, selon ton objectif.", to: routes.accompanimentSymptothermy },
    ],
  },
  final: {
    eyebrow: "Ton premier pas",
    title: "Entre dans La Clairière.",
    text: "Crée gratuitement ton espace et commence exactement là où tu en es.",
    primary: { label: "Créer mon espace", to: routes.registration },
    secondary: { label: "Échanger avec Mélanie", to: routes.contact },
  },
};
