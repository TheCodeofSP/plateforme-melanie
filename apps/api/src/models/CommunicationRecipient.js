const mongoose = require("mongoose");
const { DELIVERY_STATUSES } = require("../config/communication.constants");
const schema = new mongoose.Schema(
  {
    communication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Communication",
      required: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    quizParticipant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizParticipant",
      default: null,
    },
    firstNameSnapshot: { type: String, default: null },
    roleSnapshot: { type: String, default: null },
    spmProfileSnapshot: { type: String, default: "NON_DEFINI" },
    status: {
      type: String,
      enum: DELIVERY_STATUSES,
      default: "PENDING",
      index: true,
    },
    providerMessageId: { type: String, default: null, index: true },
    attempts: { type: Number, default: 0 },
    nextRetryAt: { type: Date, default: null, index: true },
    lastAttemptAt: Date,
    sentAt: Date,
    deliveredAt: Date,
    openedAt: Date,
    clickedAt: Date,
    readAt: Date,
    failedAt: Date,
    errorCode: String,
    errorMessage: { type: String, maxlength: 1000 },
    anonymizedAt: Date,
  },
  { timestamps: true },
);
schema.index({ communication: 1, email: 1 }, { unique: true });
schema.index({ communication: 1, user: 1 });
module.exports = mongoose.model("CommunicationRecipient", schema);
