const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema(
  {
    platform: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
  },
  { _id: false },
);

const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    categories: {
      ACCOUNT_SECURITY: { type: channelSchema, default: () => ({}) },
      RESOURCES: { type: channelSchema, default: () => ({}) },
      SAFE_PLACE: { type: channelSchema, default: () => ({}) },
      WEBINARS: { type: channelSchema, default: () => ({}) },
      COMMUNICATIONS: { type: channelSchema, default: () => ({}) },
      PERSONAL_ADMINISTRATION: { type: channelSchema, default: () => ({}) },
    },
    emailGloballyUnsubscribedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("NotificationPreference", schema);
