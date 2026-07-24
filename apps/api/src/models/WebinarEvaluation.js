const mongoose = require("mongoose");
const schema = new mongoose.Schema({ webinar: { type: mongoose.Schema.Types.ObjectId, ref: "Webinar", required: true, index: true }, session: { type: mongoose.Schema.Types.ObjectId, ref: "WebinarSession", required: true, index: true }, user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true }, rating: { type: Number, required: true, min: 1, max: 5 }, useful: { type: Boolean, required: true }, comment: { type: String, trim: true, maxlength: 3000, default: "" }, testimonialConsent: { type: Boolean, default: false }, anonymizedAt: { type: Date, default: null } }, { timestamps: true });
schema.index({ session: 1, user: 1 });
module.exports = mongoose.model("WebinarEvaluation", schema);
