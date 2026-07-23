const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResourceComment",
      default: null,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
    deletionState: {
      type: String,
      enum: ["VISIBLE", "AUTHOR_DELETED", "MODERATED"],
      default: "VISIBLE",
      index: true,
    },
    deletedAt: { type: Date, default: null },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);
schema.index({ resource: 1, createdAt: 1 });
module.exports = mongoose.model("ResourceComment", schema);
