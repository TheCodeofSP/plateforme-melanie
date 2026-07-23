const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fixtureKey: { type: String, default: null, index: true, select: false },
    email: {
      type: String,
      required: [true, "L’adresse email est obligatoire."],
      unique: true,
      trim: true,
      lowercase: true,
    },

    firstName: {
      type: String,
      required: [true, "Le prénom est obligatoire."],
      trim: true,
      minlength: [2, "Le prénom doit contenir au moins 2 caractères."],
      maxlength: [80, "Le prénom ne peut pas dépasser 80 caractères."],
    },

    lastName: {
      type: String,
      required: [true, "Le nom est obligatoire."],
      trim: true,
      minlength: [2, "Le nom doit contenir au moins 2 caractères."],
      maxlength: [80, "Le nom ne peut pas dépasser 80 caractères."],
    },

    pseudonym: {
      type: String,
      required: [true, "Le pseudonyme est obligatoire."],
      trim: true,
      minlength: [3, "Le pseudonyme doit contenir au moins 3 caractères."],
      maxlength: [30, "Le pseudonyme ne peut pas dépasser 30 caractères."],
    },

    dateOfBirth: {
      type: Date,
      required: [true, "La date de naissance est obligatoire."],
      max: [Date.now, "La date de naissance ne peut pas être dans le futur."],
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["MEMBER", "INTERVENANT", "ADMIN"],
      default: "MEMBER",
    },

    adminNotificationScopes: {
      type: [
        {
          type: String,
          enum: [
            "ACCOUNTS",
            "RESOURCES",
            "SAFE_PLACE",
            "WEBINARS",
            "COMMUNICATIONS",
            "TECHNICAL",
          ],
        },
      ],
      default: undefined,
    },

    accountStatus: {
      type: String,
      enum: ["PENDING_ACTIVATION", "ACTIVE", "SUSPENDED", "ANONYMIZED"],
      default: "PENDING_ACTIVATION",
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    currentSpmProfile: {
      type: String,
      enum: [
        "NON_DEFINI",
        "BOULE_DE_NERFS",
        "CROQUE_TOUT",
        "DOUCE_MELANCOLIE",
        "GONFLEE_A_BLOC",
      ],
      default: "NON_DEFINI",
    },

    quizCompleted: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    anonymizedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index(
  { pseudonym: 1 },
  {
    unique: true,
    collation: {
      locale: "fr",
      strength: 2,
    },
  },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
