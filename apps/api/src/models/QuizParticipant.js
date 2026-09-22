const mongoose = require("mongoose");
const { SPM_PROFILES } = require("../config/quiz.constants");

const quizParticipantSchema = new mongoose.Schema(
  {
    fixtureKey: { type: String, default: null, index: true, select: false },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    linkedAt: { type: Date, default: null },
    latestAttempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizAttempt",
      default: null,
    },
    currentSpmProfile: { type: String, enum: SPM_PROFILES, default: null },
    marketingSync: {
      status: {
        type: String,
        enum: ["NOT_REQUESTED", "PENDING", "SYNCED", "FAILED"],
        default: "NOT_REQUESTED",
      },
      syncedAt: { type: Date, default: null },
      lastError: { type: String, default: null },
      attempts: { type: Number, default: 0 },
      lastAttemptAt: { type: Date, default: null },
      nextRetryAt: { type: Date, default: null, index: true },
    },
  },
  { timestamps: true },
);

quizParticipantSchema.index({ user: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("QuizParticipant", quizParticipantSchema);
