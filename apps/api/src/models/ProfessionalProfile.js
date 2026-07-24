const mongoose = require("mongoose");

const profileVersionSchema = new mongoose.Schema(
  {
    professionalName: { type: String, trim: true, maxlength: 120, default: "" },
    displayedFirstName: { type: String, trim: true, maxlength: 80, default: "" },
    displayedLastName: { type: String, trim: true, maxlength: 80, default: "" },
    profession: { type: String, trim: true, maxlength: 120, default: "" },
    specialties: [{ type: String, trim: true, maxlength: 100 }],
    shortPresentation: { type: String, trim: true, maxlength: 500, default: "" },
    biography: { type: String, trim: true, maxlength: 5000, default: "" },
    photo: { type: mongoose.Schema.Types.ObjectId, ref: "MediaAsset", default: null },
    website: { type: String, trim: true, default: null },
  },
  { _id: false },
);

const professionalProfileSchema = new mongoose.Schema(
  {
    fixtureKey: { type: String, default: null, index: true, select: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    sourceApplication: { type: mongoose.Schema.Types.ObjectId, ref: "IntervenantApplication", required: true },
    draftVersion: { type: profileVersionSchema, default: () => ({}) },
    publishedVersion: { type: profileVersionSchema, default: null },
    publicationStatus: { type: String, enum: ["DRAFT", "PUBLISHED", "HIDDEN"], default: "DRAFT", index: true },
    reviewStatus: { type: String, enum: ["NOT_SUBMITTED", "PENDING_REVIEW", "CHANGES_REQUESTED", "APPROVED"], default: "NOT_SUBMITTED", index: true },
    submittedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    hiddenAt: { type: Date, default: null },
    hiddenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    lastAdminComment: { type: String, trim: true, maxlength: 1000, default: null },
    isActive: { type: Boolean, default: true, index: true },
    activatedAt: { type: Date, default: Date.now },
    deactivatedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

professionalProfileSchema.index({ publicationStatus: 1, "publishedVersion.profession": 1 });
professionalProfileSchema.index({ "publishedVersion.professionalName": "text", "publishedVersion.profession": "text", "publishedVersion.specialties": "text" });

module.exports = mongoose.model("ProfessionalProfile", professionalProfileSchema);
