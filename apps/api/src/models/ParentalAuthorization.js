const mongoose = require("mongoose");

const parentalAuthorizationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    guardianEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "DECLINED", "EXPIRED", "REVOKED"],
      default: "PENDING",
    },

    documentVersion: {
      type: String,
      required: true,
      trim: true,
    },

    sentAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    declinedAt: {
      type: Date,
      default: null,
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

parentalAuthorizationSchema.index({
  user: 1,
  status: 1,
  createdAt: -1,
});

const ParentalAuthorization = mongoose.model(
  "ParentalAuthorization",
  parentalAuthorizationSchema,
);

module.exports = ParentalAuthorization;
