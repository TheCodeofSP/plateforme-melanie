const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  profile: { type: mongoose.Schema.Types.ObjectId, ref: "ProfessionalProfile", required: true, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, enum: ["DRAFT_UPDATED", "SUBMITTED", "APPROVED", "CHANGES_REQUESTED", "EDITORIAL_CORRECTION", "HIDDEN", "RESTORED", "REVISION_STARTED"], required: true },
  comment: { type: String, trim: true, maxlength: 1000, default: null },
  changes: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true, versionKey: false });

schema.index({ profile: 1, createdAt: -1 });
module.exports = mongoose.model("ProfessionalProfileWorkflowLog", schema);
