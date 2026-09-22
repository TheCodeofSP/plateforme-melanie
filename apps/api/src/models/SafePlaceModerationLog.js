const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["POST", "COMMENT", "REPORT", "CATEGORY", "USER", "SUSPENSION"],
      required: true,
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    reason: { type: String, trim: true, maxlength: 2000, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true, versionKey: false },
);
schema.index({ targetType: 1, targetId: 1, createdAt: -1 });
module.exports = mongoose.model("SafePlaceModerationLog", schema);
