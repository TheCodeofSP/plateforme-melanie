const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  emailType: { type: String, required: true, trim: true, maxlength: 80, index: true },
  intendedRecipient: { type: String, required: true, lowercase: true, trim: true, index: true },
  actualRecipient: { type: String, required: true, lowercase: true, trim: true },
  subject: { type: String, required: true, maxlength: 250 },
  provider: { type: String, enum: ["RESEND"], default: "RESEND" },
  mode: { type: String, enum: ["capture", "resend"], required: true, index: true },
  status: { type: String, enum: ["SENT", "FAILED"], required: true, index: true },
  providerMessageId: { type: String, default: null, index: true },
  requestId: { type: String, default: null, index: true },
  attempts: { type: Number, default: 1, min: 1 },
  lastError: { type: String, default: null, maxlength: 500 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true, versionKey: false });

schema.index({ createdAt: -1, status: 1 });

module.exports = mongoose.model("EmailDispatchLog", schema);
