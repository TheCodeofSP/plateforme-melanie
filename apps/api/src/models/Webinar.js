const mongoose = require("mongoose");
const {
  WEBINAR_STATUSES,
  SPM_PROFILES,
} = require("../config/webinar.constants");
const schema = new mongoose.Schema(
  {
    fixtureKey: { type: String, default: null, index: true, select: false },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 350,
    },
    description: { type: String, required: true, trim: true, maxlength: 12000 },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MediaAsset",
      default: null,
    },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    platform: { type: String, enum: ["GOOGLE_MEET"], default: "GOOGLE_MEET" },
    recommendedProfiles: {
      type: [{ type: String, enum: SPM_PROFILES }],
      validate: [(v) => v.length <= 2, "Deux profils SPM maximum."],
    },
    status: {
      type: String,
      enum: WEBINAR_STATUSES,
      default: "DRAFT",
      index: true,
    },
    publishedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    archivedAt: { type: Date, default: null },
    replay: {
      url: { type: String, default: null },
      available: { type: Boolean, default: false },
      availableAt: { type: Date, default: null },
    },
    futureOrganizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);
schema.index({ status: 1, publishedAt: -1 });
schema.index({ title: "text", shortDescription: "text", description: "text" });
module.exports = mongoose.model("Webinar", schema);
