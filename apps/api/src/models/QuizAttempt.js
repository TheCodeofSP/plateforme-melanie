const mongoose = require("mongoose");
const { SPM_PROFILES, QUIZ_CATEGORIES, CONTRACEPTION_TYPES } = require("../config/quiz.constants");

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    category: { type: String, enum: QUIZ_CATEGORIES, required: true },
    questionLabel: { type: String, required: true },
    answerKey: { type: String, required: true },
    answerLabel: { type: String, required: true },
    awardedProfiles: [{ type: String, enum: SPM_PROFILES }],
  },
  { _id: false },
);

const scoresSchema = new mongoose.Schema(
  {
    BOULE_DE_NERFS: { type: Number, required: true, min: 0 },
    CROQUE_TOUT: { type: Number, required: true, min: 0 },
    DOUCE_MELANCOLIE: { type: Number, required: true, min: 0 },
    GONFLEE_A_BLOC: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const quizAttemptSchema = new mongoose.Schema(
  {
    fixtureKey: { type: String, default: null, index: true, select: false },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizParticipant",
      required: true,
      index: true,
    },
    userSnapshot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    quizVersion: { type: String, required: true },
    status: {
      type: String,
      enum: ["AWAITING_PROFILE_SELECTION", "COMPLETED"],
      required: true,
    },
    answers: { type: [answerSchema], required: true },
    participantInfo: {
      age: { type: Number, required: true, min: 18, max: 100 },
      adultConfirmed: { type: Boolean, default: false },
      contraception: {
        type: String,
        enum: CONTRACEPTION_TYPES,
        required: true,
      },
    },
    scores: { type: scoresSchema, required: true },
    calculatedProfiles: [{ type: String, enum: SPM_PROFILES }],
    selectedProfile: { type: String, enum: SPM_PROFILES, default: null },
    selectionTokenHash: { type: String, select: false, default: null },
    selectionTokenExpiresAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    resultEmail: {
      status: {
        type: String,
        enum: ["NOT_READY", "PENDING", "SENT", "FAILED"],
        default: "NOT_READY",
      },
      sentAt: { type: Date, default: null },
      lastError: { type: String, default: null },
      attempts: { type: Number, default: 0 },
      lastAttemptAt: { type: Date, default: null },
      nextRetryAt: { type: Date, default: null, index: true },
    },
  },
  { timestamps: true },
);

quizAttemptSchema.index({ participant: 1, completedAt: -1 });
quizAttemptSchema.index({ status: 1, createdAt: 1 });

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
