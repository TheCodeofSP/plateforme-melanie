const mongoose = require("mongoose");
const { REPORT_REASONS } = require("../config/resource.constants");
const schema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: { type: String, enum: ["RESOURCE", "COMMENT"], required: true },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
      index: true,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResourceComment",
      default: null,
    },
    reason: { type: String, enum: REPORT_REASONS, required: true },
    details: { type: String, trim: true, maxlength: 2000, default: null },
    status: {
      type: String,
      enum: ["OPEN", "REJECTED", "RESOLVED"],
      default: "OPEN",
      index: true,
    },
    resolution: {
      type: String,
      enum: [
        "NONE",
        "CONTENT_KEPT",
        "CORRECTION_REQUESTED",
        "COMMENT_REMOVED",
        "RESOURCE_UNPUBLISHED",
        "RESOURCE_ARCHIVED",
      ],
      default: "NONE",
    },
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
schema.index({
  reporter: 1,
  targetType: 1,
  resource: 1,
  comment: 1,
  status: 1,
});
module.exports = mongoose.model("ResourceReport", schema);
