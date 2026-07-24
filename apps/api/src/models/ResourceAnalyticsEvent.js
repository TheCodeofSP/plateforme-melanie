const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  resource: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true, index: true },
  type: { type: String, enum: ["VIEW", "DOWNLOAD", "EXTERNAL_CLICK"], required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  visitorIdHash: { type: String, default: null, index: true },
  spmProfile: { type: String, default: "NON_DEFINI" },
  occurredAt: { type: Date, default: Date.now, index: true },
  dedupeKey: { type: String, unique: true, sparse: true },
}, { timestamps: false });
schema.index({ resource: 1, occurredAt: -1, type: 1 });
module.exports = mongoose.model("ResourceAnalyticsEvent", schema);
