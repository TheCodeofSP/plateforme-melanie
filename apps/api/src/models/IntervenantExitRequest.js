const mongoose = require("mongoose");

const intervenantExitRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "DECLINED", "CANCELLED"],
      default: "PENDING",
    },

    requestedAt: {
      type: Date,
      required: true,
      default: Date.now,
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

intervenantExitRequestSchema.index({
  user: 1,
  status: 1,
  createdAt: -1,
});

const IntervenantExitRequest = mongoose.model(
  "IntervenantExitRequest",
  intervenantExitRequestSchema,
);

module.exports = IntervenantExitRequest;
