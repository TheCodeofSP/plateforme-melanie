const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      default: null,
      index: true,
    },
    safePlacePost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SafePlacePost",
      default: null,
      index: true,
    },
    webinar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Webinar",
      default: null,
      index: true,
    },
    communication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Communication",
      default: null,
      index: true,
    },
    purpose: {
      type: String,
      enum: [
        "COVER",
        "PDF",
        "AUDIO",
        "VIDEO",
        "PROFILE_PHOTO",
        "SAFE_PLACE_IMAGE",
        "WEBINAR_IMAGE",
        "COMMUNICATION_IMAGE",
      ],
      required: true,
    },
    storageKey: { type: String, required: true, unique: true },
    provider: { type: String, enum: ["CLOUDINARY"], default: "CLOUDINARY" },
    resourceType: {
      type: String,
      enum: ["image", "video", "raw"],
      default: null,
    },
    deliveryType: {
      type: String,
      enum: ["upload", "authenticated"],
      default: null,
    },
    providerVersion: { type: Number, default: null },
    providerFormat: { type: String, default: null },
    originalName: { type: String, required: true, trim: true, maxlength: 255 },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "REPLACED", "DELETED"],
      default: "PENDING",
      index: true,
    },
    visibility: {
      type: String,
      enum: ["PUBLIC", "MEMBERS_ONLY"],
      default: "MEMBERS_ONLY",
    },
    confirmedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
module.exports = mongoose.model("MediaAsset", schema);
