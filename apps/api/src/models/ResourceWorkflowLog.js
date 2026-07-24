const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  resource: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  actorRole: { type: String, enum: ["ADMIN", "INTERVENANT", "SYSTEM"], required: true },
  action: { type: String, required: true, trim: true, index: true },
  reason: { type: String, trim: true, maxlength: 2000, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
module.exports = mongoose.model("ResourceWorkflowLog", schema);
