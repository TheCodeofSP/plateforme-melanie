const mongoose = require("mongoose");

const emailChangeRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    newEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
      default: "PENDING",
    },

    expiresAt: {
      type: Date,
      required: true,
      index: {
        expireAfterSeconds: 0,
      },
    },

    confirmedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

emailChangeRequestSchema.index({
  user: 1,
  status: 1,
  createdAt: -1,
});

const EmailChangeRequest = mongoose.model(
  "EmailChangeRequest",
  emailChangeRequestSchema,
);

module.exports = EmailChangeRequest;
