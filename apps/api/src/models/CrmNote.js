const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrmContact",
      required: true,
      index: true,
    },
    text: { type: String, required: true, trim: true, maxlength: 5000 },
    pinned: { type: Boolean, default: false, index: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
schema.index({ contact: 1, pinned: -1, createdAt: -1 });
module.exports = mongoose.model("CrmNote", schema);
