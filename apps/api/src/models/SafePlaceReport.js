const mongoose = require("mongoose");
const {
  SAFE_PLACE_REPORT_REASONS,
  SAFE_PLACE_REPORT_STATUSES,
} = require("../config/safePlace.constants");
const schema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    targetType: { type: String, enum: ["POST", "COMMENT"], required: true },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SafePlacePost",
      required: true,
      index: true,
    },
    reason: { type: String, enum: SAFE_PLACE_REPORT_REASONS, required: true },
    details: { type: String, trim: true, maxlength: 2000, default: null },
    priority: {
      type: String,
      enum: ["NORMAL", "HIGH", "CRITICAL"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: SAFE_PLACE_REPORT_STATUSES,
      default: "OPEN",
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: { type: Date, default: null },
    resolution: { type: String, trim: true, maxlength: 80, default: null },
    adminComment: { type: String, trim: true, maxlength: 2000, default: null },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: { type: Date, default: null },
    openDedupeKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);
schema.index({ status: 1, priority: 1, createdAt: 1 });
module.exports = mongoose.model("SafePlaceReport", schema);
