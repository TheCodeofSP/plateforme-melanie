const mongoose = require("mongoose");
const {
  SAFE_PLACE_CONTENT_STATUSES,
  SAFE_PLACE_REACTIONS,
} = require("../config/safePlace.constants");
const linkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 120 },
    url: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { _id: false },
);
const imageSchema = new mongoose.Schema(
  {
    media: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MediaAsset",
      required: true,
    },
    alt: { type: String, required: true, trim: true, maxlength: 300 },
  },
  { _id: false },
);
const reactionCounts = Object.fromEntries(
  SAFE_PLACE_REACTIONS.map((key) => [
    key,
    { type: Number, default: 0, min: 0 },
  ]),
);
const schema = new mongoose.Schema(
  {
    fixtureKey: { type: String, default: null, index: true, select: false },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SafePlaceCategory",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 180,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 10000,
    },
    links: { type: [linkSchema], default: [] },
    images: { type: [imageSchema], default: [] },
    status: {
      type: String,
      enum: SAFE_PLACE_CONTENT_STATUSES,
      default: "VISIBLE",
      index: true,
    },
    allowComments: { type: Boolean, default: true },
    allowReactions: { type: Boolean, default: true },
    correctionDraft: {
      title: { type: String, trim: true, maxlength: 180, default: null },
      content: { type: String, trim: true, maxlength: 10000, default: null },
      links: { type: [linkSchema], default: undefined },
      images: { type: [imageSchema], default: undefined },
    },
    correctionRequest: {
      message: { type: String, trim: true, maxlength: 2000, default: null },
      requestedAt: { type: Date, default: null },
      requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
    isClosed: { type: Boolean, default: false, index: true },
    closedAt: { type: Date, default: null },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isPinned: { type: Boolean, default: false, index: true },
    pinnedAt: { type: Date, default: null },
    pinnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    adminWarning: {
      text: { type: String, trim: true, maxlength: 1000, default: null },
      addedAt: { type: Date, default: null },
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
    counters: {
      comments: { type: Number, default: 0, min: 0 },
      replies: { type: Number, default: 0, min: 0 },
      reactions: { type: reactionCounts, default: () => ({}) },
    },
    editedAt: { type: Date, default: null },
    lastActivityAt: { type: Date, default: Date.now, index: true },
    deletedAt: { type: Date, default: null },
    moderatedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
schema.index({ title: "text", content: "text" });
schema.index({ status: 1, category: 1, isPinned: -1, lastActivityAt: -1 });
module.exports = mongoose.model("SafePlacePost", schema);
