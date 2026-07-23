const mongoose = require("mongoose");
const { INVITATION_STATUSES } = require("../config/dashboard.constants");
const schema = new mongoose.Schema(
  {
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrmContact",
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true, select: false },
    status: {
      type: String,
      enum: INVITATION_STATUSES,
      default: "CREATED",
      index: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    sentAt: { type: Date, default: null },
    openedAt: { type: Date, default: null },
    acceptedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    lastSentAt: { type: Date, default: null },
    sendCount: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("CrmInvitation", schema);
