const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  resource: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
schema.index({ resource: 1, user: 1 }, { unique: true });
module.exports = mongoose.model("ResourceLike", schema);
