const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  sourceMonth: { type: String, required: true, index: true },
  profile: { type: String, enum: ["BOULE_DE_NERFS", "CROQUE_TOUT", "DOUCE_MELANCOLIE", "GONFLEE_A_BLOC"], required: true },
  ageRange: { type: String, enum: ["15_17", "18_24", "25_34", "35_44", "45_59", "60_PLUS"], required: true },
  contraception: { type: String, required: true },
}, { timestamps: true, versionKey: false });
schema.index({ sourceMonth: 1, profile: 1 });
module.exports = mongoose.model("QuizAnonymousArchive", schema);
