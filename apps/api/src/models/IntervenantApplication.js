const mongoose = require("mongoose");

const intervenantApplicationSchema = new mongoose.Schema(
  {
    fixtureKey: { type: String, default: null, index: true, select: false },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    professionalName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    profession: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    specialties: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 100,
        },
      ],
      default: [],
    },

    presentation: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    motivations: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    links: {
      website: {
        type: String,
        trim: true,
        default: null,
      },

      instagram: {
        type: String,
        trim: true,
        default: null,
      },

      linkedin: {
        type: String,
        trim: true,
        default: null,
      },
    },

    supportingDocument: {
      storageKey: {
        type: String,
        default: null,
      },

      url: {
        type: String,
        default: null,
      },

      originalName: {
        type: String,
        default: null,
      },

      mimeType: {
        type: String,
        enum: ["application/pdf", "image/jpeg", "image/png", null],
        default: null,
      },

      size: {
        type: Number,
        min: 0,
        default: null,
      },
    },

    status: {
      type: String,
      enum: ["DRAFT", "PENDING", "APPROVED", "DECLINED", "CANCELLED"],
      default: "DRAFT",
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    decidedAt: {
      type: Date,
      default: null,
    },

    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    adminComment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

intervenantApplicationSchema.index({
  user: 1,
  status: 1,
  createdAt: -1,
});

const IntervenantApplication = mongoose.model(
  "IntervenantApplication",
  intervenantApplicationSchema,
);

module.exports = IntervenantApplication;
