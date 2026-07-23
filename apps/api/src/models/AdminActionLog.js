const mongoose = require("mongoose");

const adminActionLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: [
        "INTERVENANT_APPLICATION_APPROVED",
        "INTERVENANT_APPLICATION_DECLINED",
        "INTERVENANT_EXIT_APPROVED",
        "INTERVENANT_EXIT_DECLINED",
        "INTERVENANT_ROLE_REVOKED",
        "ACCOUNT_SUSPENDED",
        "ACCOUNT_REACTIVATED",
        "ACCOUNT_ANONYMIZED",
        "ROLE_CHANGED",
      ],
      required: true,
      index: true,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },

    previousState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    newState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    relatedDocument: {
      model: {
        type: String,
        trim: true,
        default: null,
      },

      id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

adminActionLogSchema.index({
  targetUser: 1,
  createdAt: -1,
});

adminActionLogSchema.index({
  admin: 1,
  createdAt: -1,
});

const AdminActionLog = mongoose.model("AdminActionLog", adminActionLogSchema);

module.exports = AdminActionLog;
