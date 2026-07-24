const mongoose = require("mongoose");
const schema = new mongoose.Schema({ owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }, kind: { type: String, enum: ["SEGMENT", "VIEW", "ANALYSIS"], required: true, index: true }, name: { type: String, required: true, trim: true, maxlength: 120 }, mode: { type: String, enum: ["DYNAMIC", "STATIC", null], default: null }, area: { type: String, default: null, maxlength: 80 }, criteria: { type: mongoose.Schema.Types.Mixed, default: {} }, contactIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "CrmContact" }], deletedAt: { type: Date, default: null } }, { timestamps: true });
schema.index({ owner: 1, kind: 1, deletedAt: 1, name: 1 });
module.exports = mongoose.model("DashboardSavedItem", schema);
