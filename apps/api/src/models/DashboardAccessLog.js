const mongoose = require("mongoose");
const schema = new mongoose.Schema({ admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }, action: { type: String, enum: ["VIEW_BIRTH_DATE", "VIEW_QUIZ_DETAILS", "VIEW_PRIVATE_NOTES", "VIEW_CONTACT_HISTORY", "EXPORT_CREATED"], required: true, index: true }, targetType: { type: String, required: true }, targetId: { type: mongoose.Schema.Types.ObjectId, default: null }, occurredAt: { type: Date, default: Date.now, index: true } }, { timestamps: false });
module.exports = mongoose.model("DashboardAccessLog", schema);
