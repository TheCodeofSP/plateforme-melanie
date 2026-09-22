const mongoose = require("mongoose");
const {
  CRM_STATUSES,
  CONTACT_SOURCES,
  TASK_PRIORITIES,
} = require("../config/dashboard.constants");
const sourceSchema = new mongoose.Schema(
  {
    type: { type: String, enum: CONTACT_SOURCES, required: true },
    occurredAt: { type: Date, default: Date.now },
    detail: { type: String, default: null, maxlength: 200 },
  },
  { _id: false },
);
const consentSchema = new mongoose.Schema(
  {
    granted: { type: Boolean, default: false },
    occurredAt: { type: Date, default: null },
    source: { type: String, default: null, maxlength: 200 },
  },
  { _id: false },
);
const schema = new mongoose.Schema(
  {
    fixtureKey: { type: String, default: null, index: true, select: false },
    primaryEmail: { type: String, required: true, lowercase: true, trim: true },
    emailAliases: [{ type: String, lowercase: true, trim: true }],
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    lastName: { type: String, trim: true, default: null, maxlength: 80 },
    phone: { type: String, trim: true, default: null, maxlength: 40 },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    quizParticipant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizParticipant",
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: CRM_STATUSES,
      default: "NOUVEAU",
      index: true,
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: "NORMAL",
      index: true,
    },
    sources: { type: [sourceSchema], default: [] },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "CrmTag" }],
    marketingConsent: { type: consentSchema, default: () => ({}) },
    doNotContact: { type: Boolean, default: false, index: true },
    currentSpmProfile: { type: String, default: "NON_DEFINI", index: true },
    currentContraception: { type: String, default: null, index: true },
    latestQuizAt: { type: Date, default: null },
    lastActivityAt: { type: Date, default: null, index: true },
    lastOptionalCommunicationAt: { type: Date, default: null },
    mergedInto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrmContact",
      default: null,
      index: true,
    },
    anonymizedAt: { type: Date, default: null, index: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);
schema.index(
  { primaryEmail: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);
schema.index({ status: 1, currentSpmProfile: 1, currentContraception: 1 });
schema.index({ tags: 1, status: 1 });
module.exports = mongoose.model("CrmContact", schema);
