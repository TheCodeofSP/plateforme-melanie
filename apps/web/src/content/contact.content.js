export const contactContent = {
  hero: {
    eyebrow: "Nous contacter",

    title: "Commence par nous dire ce dont tu as besoin.",

    introduction: [
      "Tu n’as pas besoin de savoir quel accompagnement choisir avant d’écrire.",
      "Une question, une hésitation ou quelques mots sur ce que tu traverses suffisent pour commencer.",
    ],
  },

  methods: {
    title: "Choisis le chemin qui te convient",
    items: [
      {
        type: "email",
        title: "Par e-mail",
        text: "Écris directement à Mélanie pour une question ou un premier échange.",
      },
      {
        type: "instagram",
        title: "Sur Instagram",
        text: "Retrouve les publications de Mélanie et contacte-la depuis son profil.",
      },
      {
        type: "location",
        title: "En présentiel",
        text: "Certains accompagnements peuvent être proposés en présentiel.",
      },
      {
        type: "booking",
        title: "Prendre rendez-vous",
        text: "Choisis directement un créneau disponible dans l’agenda de Mélanie.",
      },
    ],
  },

  form: {
    title: "Échanger avec Mélanie",

    description:
      "Le formulaire prépare un email dans ton application habituelle. Tu pourras le vérifier avant de l’envoyer.",

    fields: {
      firstName: {
        label: "Prénom",
        placeholder: "Ton prénom",
      },

      email: {
        label: "Adresse e-mail",
        placeholder: "ton@email.com",
      },

      subject: {
        label: "Sujet",
        placeholder: "Le sujet de ton message",
      },

      message: {
        label: "Message",
        placeholder: "Décris-moi ta situation...",
      },
    },

    submit: "Envoyer mon message",

    success: "Merci pour ton message. Je reviendrai vers toi dès que possible.",

    error: "Une erreur est survenue. Merci de réessayer.",
  },
};
