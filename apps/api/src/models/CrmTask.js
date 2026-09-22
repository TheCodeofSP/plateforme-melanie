const mongoose = require("mongoose");
const {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_RESULTS,
} = require("../config/dashboard.constants");
const dateHistorySchema = new mongoose.Schema(
  {
    previousDueAt: Date,
    newDueAt: Date,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false },
);
const schema = new mongoose.Schema(
  {
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrmContact",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    dueAt: { type: Date, required: true, index: true },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: "NORMAL",
      index: true,
    },
    note: { type: String, trim: true, default: null, maxlength: 2000 },
    status: { type: String, enum: TASK_STATUSES, default: "TODO", index: true },
    result: { type: String, enum: [...TASK_RESULTS, null], default: null },
    resultNote: { type: String, default: null, maxlength: 2000 },
    dateHistory: { type: [dateHistorySchema], default: [] },
    completedAt: { type: Date, default: null },
    notifiedForDueAt: { type: Date, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);
schema.index({ status: 1, dueAt: 1 });
module.exports = mongoose.model("CrmTask", schema);
