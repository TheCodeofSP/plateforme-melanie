const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    normalizedName: { type: String, required: true, unique: true },
    color: { type: String, required: true, match: /^#[0-9a-f]{6}$/i },
    archivedAt: { type: Date, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("CrmTag", schema);
