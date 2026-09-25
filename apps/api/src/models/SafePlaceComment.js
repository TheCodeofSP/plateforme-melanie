const mongoose = require("mongoose");
const {
  SAFE_PLACE_CONTENT_STATUSES,
  SAFE_PLACE_REACTIONS,
} = require("../config/safePlace.constants");
const reactionCounts = Object.fromEntries(
  SAFE_PLACE_REACTIONS.map((key) => [key, { type: Number, default: 0, min: 0 }]),
);
const schema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SafePlacePost",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    signatureType: {
      type: String,
      enum: ["PSEUDONYM", "FIRST_NAME"],
      default: "PSEUDONYM",
    },
    authorNameSnapshot: { type: String, trim: true, maxlength: 80, default: null },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SafePlaceComment",
      default: null,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: SAFE_PLACE_CONTENT_STATUSES,
      default: "VISIBLE",
      index: true,
    },
    correctionDraft: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: null,
    },
    correctionRequest: {
      message: { type: String, trim: true, maxlength: 2000, default: null },
      requestedAt: Date,
      requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
    counters: {
      replies: { type: Number, default: 0, min: 0 },
      reactions: { type: reactionCounts, default: () => ({}) },
    },
    editedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    moderatedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
schema.index({ post: 1, parent: 1, createdAt: 1 });
module.exports = mongoose.model("SafePlaceComment", schema);
