const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  job: { type: String, required: true, index: true },
  status: { type: String, enum: ["SUCCESS", "PARTIAL", "FAILED"], required: true },
  processed: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
  details: { type: mongoose.Schema.Types.Mixed, default: null },
  error: { type: String, maxlength: 1000, default: null },
  startedAt: { type: Date, required: true },
  completedAt: { type: Date, required: true },
}, { timestamps: true, versionKey: false });

schema.index({ job: 1, createdAt: -1 });
module.exports = mongoose.model("CronRunLog", schema);
