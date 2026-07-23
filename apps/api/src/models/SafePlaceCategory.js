const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    fixtureKey: { type: String, default: null, index: true, select: false },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    displayOrder: { type: Number, required: true, min: 0, default: 0 },
    status: {
      type: String,
      enum: ["ACTIVE", "HIDDEN", "ARCHIVED"],
      default: "ACTIVE",
      index: true,
    },
    allowNewPosts: { type: Boolean, default: true },
    adminOnly: { type: Boolean, default: false },
    allowComments: { type: Boolean, default: true },
    allowReactions: { type: Boolean, default: true },
    counters: {
      posts: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);
schema.index({ status: 1, displayOrder: 1 });
module.exports = mongoose.model("SafePlaceCategory", schema);
