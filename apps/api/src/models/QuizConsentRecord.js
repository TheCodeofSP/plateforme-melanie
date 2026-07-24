const mongoose = require("mongoose");
const { QUIZ_CONSENT_TYPES } = require("../config/quiz.constants");

const quizConsentRecordSchema = new mongoose.Schema({
  participant: { type: mongoose.Schema.Types.ObjectId, ref: "QuizParticipant", required: true, index: true },
  attempt: { type: mongoose.Schema.Types.ObjectId, ref: "QuizAttempt", required: true, index: true },
  type: { type: String, enum: QUIZ_CONSENT_TYPES, required: true },
  granted: { type: Boolean, required: true },
  textVersion: { type: String, required: true, trim: true },
  acceptedAt: { type: Date, default: null },
  withdrawnAt: { type: Date, default: null },
}, { timestamps: true });

quizConsentRecordSchema.index({ participant: 1, type: 1, createdAt: -1 });
quizConsentRecordSchema.index({ attempt: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("QuizConsentRecord", quizConsentRecordSchema);
