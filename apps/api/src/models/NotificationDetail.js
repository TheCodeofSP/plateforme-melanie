const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    notification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
      index: true,
    },
    eventKey: { type: String, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    pseudonymSnapshot: { type: String, default: null, maxlength: 30 },
    reactionType: { type: String, default: null, maxlength: 50 },
    occurredAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true, index: true },
    removedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

schema.index({ notification: 1, eventKey: 1 }, { unique: true });
schema.index({ notification: 1, active: 1, occurredAt: -1 });

module.exports = mongoose.model("NotificationDetail", schema);
