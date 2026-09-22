const mongoose = require("mongoose");
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
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["OPEN", "ANSWERED", "ARCHIVED", "DELETED"],
      default: "OPEN",
      index: true,
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
module.exports = mongoose.model("WebinarQuestion", schema);
