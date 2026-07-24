const mongoose = require("mongoose");
const {
  NOTIFICATION_NATURES,
  NOTIFICATION_CATEGORIES,
  TYPES,
  TARGET_TYPES,
} = require("../config/notification.constants");

const schema = new mongoose.Schema(
  {
    fixtureKey: { type: String, default: null, index: true, select: false },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    nature: {
      type: String,
      enum: NOTIFICATION_NATURES,
      default: "PERSONAL",
      index: true,
    },
    category: {
      type: String,
      enum: NOTIFICATION_CATEGORIES,
      default: "SAFE_PLACE",
      index: true,
    },
    type: { type: String, enum: TYPES, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    targetType: { type: String, enum: [...TARGET_TYPES, null], default: null },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    communicationRecipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunicationRecipient",
      default: null,
    },
    actionPath: { type: String, default: null, maxlength: 500 },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    groupKey: { type: String, default: null, index: true },
    deduplicationKey: { type: String, default: null },
    activeDetailCount: { type: Number, default: 0, min: 0 },
    readAt: { type: Date, default: null, index: true },
    handledAt: { type: Date, default: null, index: true },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    deletedAt: { type: Date, default: null, index: true },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      index: true,
    },
    mandatory: { type: Boolean, default: false },
    isTest: { type: Boolean, default: false },
  },
  { timestamps: true },
);

schema.index({ recipient: 1, nature: 1, deletedAt: 1, updatedAt: -1 });
schema.index(
  { recipient: 1, deduplicationKey: 1 },
  {
    unique: true,
    partialFilterExpression: { deduplicationKey: { $type: "string" } },
  },
);

module.exports = mongoose.model("Notification", schema);
