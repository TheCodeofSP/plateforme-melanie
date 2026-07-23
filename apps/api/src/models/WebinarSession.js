const mongoose = require("mongoose");
const { SESSION_STATUSES } = require("../config/webinar.constants");
const schema = new mongoose.Schema(
  {
    fixtureKey: { type: String, default: null, index: true, select: false },
    webinar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Webinar",
      required: true,
      index: true,
    },
    startsAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, required: true, min: 15, max: 480 },
    timezone: { type: String, default: "Europe/Paris", maxlength: 80 },
    capacity: { type: Number, required: true, min: 1, max: 10000 },
    meetUrl: { type: String, default: null, select: false },
    status: {
      type: String,
      enum: SESSION_STATUSES,
      default: "SCHEDULED",
      index: true,
    },
    registrationsManuallyClosed: { type: Boolean, default: false },
    registrationsClosedAt: { type: Date, default: null },
    previousStartsAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    counters: {
      registered: { type: Number, default: 0 },
      waitlisted: { type: Number, default: 0 },
      present: { type: Number, default: 0 },
      absent: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);
schema.index({ webinar: 1, startsAt: 1 });
module.exports = mongoose.model("WebinarSession", schema);
