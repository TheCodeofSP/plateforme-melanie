const mongoose = require("mongoose");
const schema = new mongoose.Schema({ contact: { type: mongoose.Schema.Types.ObjectId, ref: "CrmContact", required: true, index: true }, type: { type: String, required: true, trim: true, maxlength: 80, index: true }, actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, summary: { type: String, required: true, maxlength: 500 }, relatedModel: { type: String, default: null }, relatedId: { type: mongoose.Schema.Types.ObjectId, default: null }, metadata: { type: mongoose.Schema.Types.Mixed, default: null }, occurredAt: { type: Date, default: Date.now, index: true } }, { timestamps: false });
schema.index({ contact: 1, occurredAt: -1 });
module.exports = mongoose.model("CrmTimelineEvent", schema);
