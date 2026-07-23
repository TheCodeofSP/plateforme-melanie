const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizParticipant",
      required: true,
      index: true,
    },
    attempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizAttempt",
      default: null,
    },
    action: {
      type: String,
      enum: [
        "PARTICIPANT_VIEWED",
        "ATTEMPT_DETAILS_VIEWED",
        "EMAIL_RETRY_REQUESTED",
        "MARKETING_SYNC_RETRY_REQUESTED",
      ],
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

schema.index({ admin: 1, createdAt: -1 });
module.exports = mongoose.model("QuizAdminAccessLog", schema);
