const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },

    userAgent: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "Appareil inconnu",
    },

    rememberMe: {
      type: Boolean,
      default: false,
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: {
        expireAfterSeconds: 0,
      },
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

sessionSchema.index({
  user: 1,
  revokedAt: 1,
  expiresAt: 1,
});

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
