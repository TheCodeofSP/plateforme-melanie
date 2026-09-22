const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    primaryContact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrmContact",
      required: true,
    },
    mergedContact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrmContact",
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    primaryBefore: { type: mongoose.Schema.Types.Mixed, required: true },
    mergedBefore: { type: mongoose.Schema.Types.Mixed, required: true },
    restoredAt: { type: Date, default: null },
    restoredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("CrmMergeLog", schema);
