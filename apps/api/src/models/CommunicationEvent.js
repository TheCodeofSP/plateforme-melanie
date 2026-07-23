const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    communication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Communication",
      default: null,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunicationRecipient",
      default: null,
      index: true,
    },
    providerEventId: { type: String, required: true, unique: true },
    providerMessageId: { type: String, default: null, index: true },
    type: {
      type: String,
      enum: [
        "REQUEST",
        "DELIVERED",
        "OPENED",
        "CLICKED",
        "TEMPORARY_FAILURE",
        "PERMANENT_FAILURE",
        "BLOCKED",
        "SPAM",
        "UNSUBSCRIBED",
      ],
      required: true,
      index: true,
    },
    url: { type: String, default: null },
    occurredAt: { type: Date, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);
module.exports = mongoose.model("CommunicationEvent", schema);
