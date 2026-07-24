const mongoose = require("mongoose");
const {
  RESOURCE_FORMATS, RESOURCE_CATEGORIES, SPM_PROFILES,
  PUBLICATION_STATUSES, REVIEW_STATUSES, RESOURCE_VISIBILITIES,
} = require("../config/resource.constants");

const contentBlockSchema = new mongoose.Schema({
  type: { type: String, enum: ["PARAGRAPH", "HEADING", "BULLET_LIST", "NUMBERED_LIST", "QUOTE"], required: true },
  text: { type: String, trim: true, maxlength: 10000 },
  items: [{ type: String, trim: true, maxlength: 1000 }],
  links: [{ label: { type: String, trim: true, maxlength: 200 }, url: { type: String, trim: true } }],
}, { _id: false });

const versionSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: 180 },
  description: { type: String, trim: true, maxlength: 1000 },
  format: { type: String, enum: RESOURCE_FORMATS },
  categories: [{ type: String, enum: RESOURCE_CATEGORIES }],
  recommendedSpmProfiles: [{ type: String, enum: SPM_PROFILES }],
  keywords: [{ type: String, trim: true, maxlength: 60 }],
  durationMinutes: { type: Number, min: 1, max: 10000 },
  proposedVisibility: { type: String, enum: RESOURCE_VISIBILITIES, default: "PUBLIC" },
  coverMedia: { type: mongoose.Schema.Types.ObjectId, ref: "MediaAsset", default: null },
  coverAlt: { type: String, trim: true, maxlength: 300, default: null },
  coverCredit: { type: String, trim: true, maxlength: 200, default: null },
  coverCaption: { type: String, trim: true, maxlength: 300, default: null },
  blocks: { type: [contentBlockSchema], default: [] },
  sourceMode: { type: String, enum: ["HOSTED", "EXTERNAL", "MIXED", "TEXT"], default: "TEXT" },
  media: { type: mongoose.Schema.Types.ObjectId, ref: "MediaAsset", default: null },
  pdf: { type: mongoose.Schema.Types.ObjectId, ref: "MediaAsset", default: null },
  externalUrl: { type: String, trim: true, default: null },
  externalPlatform: { type: String, trim: true, maxlength: 80, default: null },
  showName: { type: String, trim: true, maxlength: 160, default: null },
  episodeNumber: { type: Number, min: 1, default: null },
}, { _id: false });

const resourceSchema = new mongoose.Schema({
  fixtureKey: { type: String, default: null, index: true, select: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  authorRole: { type: String, enum: ["ADMIN", "INTERVENANT"], required: true },
  professionalProfile: { type: mongoose.Schema.Types.ObjectId, ref: "ProfessionalProfile", default: null },
  slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
  publicationStatus: { type: String, enum: PUBLICATION_STATUSES, default: "DRAFT", index: true },
  reviewStatus: { type: String, enum: REVIEW_STATUSES, default: "NOT_SUBMITTED", index: true },
  publishedVersion: { type: versionSchema, default: null },
  workingVersion: { type: versionSchema, default: () => ({}) },
  finalVisibility: { type: String, enum: RESOURCE_VISIBILITIES, default: null },
  scheduledFor: { type: Date, default: null, index: true },
  firstPublishedAt: { type: Date, default: null },
  lastPublishedAt: { type: Date, default: null },
  unpublishedAt: { type: Date, default: null },
  archivedAt: { type: Date, default: null },
  correctionRequest: { message: { type: String, trim: true, maxlength: 2000 }, requestedAt: Date, requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" } },
  counters: { likes: { type: Number, default: 0 }, comments: { type: Number, default: 0 }, views: { type: Number, default: 0 } },
  externalImportKey: { type: String, trim: true, unique: true, sparse: true },
}, { timestamps: true });

resourceSchema.index({ "publishedVersion.title": "text", "publishedVersion.description": "text", "publishedVersion.keywords": "text", "publishedVersion.blocks.text": "text" });
resourceSchema.index({ publicationStatus: 1, scheduledFor: 1, "publishedVersion.categories": 1 });

module.exports = mongoose.model("Resource", resourceSchema);
