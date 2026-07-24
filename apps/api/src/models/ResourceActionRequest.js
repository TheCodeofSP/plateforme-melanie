const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  resource: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true, index: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["UNPUBLISH", "ARCHIVE"], required: true },
  reason: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING", index: true },
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  decisionComment: { type: String, trim: true, maxlength: 2000, default: null },
  decidedAt: { type: Date, default: null },
}, { timestamps: true });
schema.index({ resource: 1, type: 1, status: 1 });
module.exports = mongoose.model("ResourceActionRequest", schema);
