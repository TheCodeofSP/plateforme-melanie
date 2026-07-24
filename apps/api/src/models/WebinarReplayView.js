const mongoose = require("mongoose");
const schema = new mongoose.Schema({ webinar: { type: mongoose.Schema.Types.ObjectId, ref: "Webinar", required: true, index: true }, user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true }, views: { type: Number, default: 1 }, firstViewedAt: { type: Date, default: Date.now }, lastViewedAt: { type: Date, default: Date.now } }, { timestamps: true });
schema.index({ webinar: 1, user: 1 });
module.exports = mongoose.model("WebinarReplayView", schema);
