const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    notification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      default: null,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, maxlength: 180 },
    htmlContent: { type: String, required: true },
    idempotencyKey: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: [
        "PENDING",
        "SENT",
        "DELIVERED",
        "OPENED",
        "CLICKED",
        "TEMPORARY_FAILURE",
        "PERMANENT_FAILURE",
        "BLOCKED",
        "SPAM",
        "UNSUBSCRIBED",
      ],
      default: "PENDING",
      index: true,
    },
    attempts: { type: Number, default: 0 },
    nextRetryAt: { type: Date, default: null, index: true },
    providerMessageId: { type: String, default: null, index: true },
    sentAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    openedAt: { type: Date, default: null },
    clickedAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    lastError: { type: String, default: null, maxlength: 1000 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("NotificationDelivery", schema);
