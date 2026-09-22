const mongoose = require("mongoose");
const { REGISTRATION_STATUSES } = require("../config/webinar.constants");
const schema = new mongoose.Schema(
  {
    webinar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Webinar",
      required: true,
      index: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WebinarSession",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    activeKey: { type: String, default: undefined },
    status: {
      type: String,
      enum: REGISTRATION_STATUSES,
      required: true,
      index: true,
    },
    waitlistPosition: { type: Number, default: null },
    promotedAt: { type: Date, default: null },
    confirmationExpiresAt: { type: Date, default: null, index: true },
    confirmedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    attendanceMarkedAt: { type: Date, default: null },
    registeredByAdmin: { type: Boolean, default: false },
    capacityOverride: { type: Boolean, default: false },
    reminder24SentAt: { type: Date, default: null },
    reminder1SentAt: { type: Date, default: null },
    replayNotifiedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
schema.index({ webinar: 1, user: 1, status: 1 });
schema.index({ activeKey: 1 }, { unique: true, sparse: true });
schema.index({ session: 1, status: 1, waitlistPosition: 1 });
module.exports = mongoose.model("WebinarRegistration", schema);
