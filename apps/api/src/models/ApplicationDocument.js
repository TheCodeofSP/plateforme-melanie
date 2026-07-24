const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: "IntervenantApplication", required: true, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  storageKey: { type: String, required: true, unique: true },
  originalName: { type: String, trim: true, required: true },
  mimeType: { type: String, enum: ["application/pdf", "image/jpeg", "image/png"], required: true },
  size: { type: Number, min: 1, max: 10485760, required: true },
  resourceType: { type: String, enum: ["image", "raw"], required: true },
  providerVersion: { type: Number, default: null },
  providerFormat: { type: String, default: null },
  status: { type: String, enum: ["PENDING", "ACTIVE", "REPLACED", "DELETED"], default: "PENDING", index: true },
  confirmedAt: { type: Date, default: null },
  deleteAfter: { type: Date, default: null, index: true },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

schema.index({ application: 1, status: 1 });
module.exports = mongoose.model("ApplicationDocument", schema);
