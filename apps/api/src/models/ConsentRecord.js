const mongoose = require("mongoose");

const consentRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "TERMS",
        "PRIVACY_POLICY",
        "NEWSLETTER",
        "COMMERCIAL_EMAIL",
        "SPM_DATA_PROCESSING",
        "SAFE_PLACE_CHARTER",
      ],
      required: true,
    },

    version: {
      type: String,
      required: true,
      trim: true,
    },

    granted: {
      type: Boolean,
      required: true,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    withdrawnAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

consentRecordSchema.index({
  user: 1,
  type: 1,
  createdAt: -1,
});

const ConsentRecord = mongoose.model("ConsentRecord", consentRecordSchema);

module.exports = ConsentRecord;
