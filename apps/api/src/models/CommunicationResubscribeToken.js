const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true },
    preferences: { type: mongoose.Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    usedAt: Date,
  },
  { timestamps: true },
);
module.exports = mongoose.model("CommunicationResubscribeToken", schema);
