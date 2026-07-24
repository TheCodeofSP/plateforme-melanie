const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  version: { type: String, required: true, trim: true },
  status: { type: String, enum: ["SUCCESS", "FAILED", "HISTORICAL"], required: true },
  durationMs: { type: Number, default: null, min: 0 },
  summary: { type: String, default: null, maxlength: 1000 },
  error: { type: String, default: null, maxlength: 1000 },
  executedAt: { type: Date, default: Date.now },
}, { timestamps: true, versionKey: false });

schema.index({ name: 1, version: 1 }, { unique: true });

module.exports = mongoose.model("MigrationRecord", schema);
