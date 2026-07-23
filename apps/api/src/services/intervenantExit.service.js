const mongoose = require("mongoose");

const User = require("../models/User");

const ProfessionalProfile = require("../models/ProfessionalProfile");

const IntervenantExitRequest = require("../models/IntervenantExitRequest");

const AdminActionLog = require("../models/AdminActionLog");

function createExitError(message, code, statusCode) {
  const error = new Error(message);

  error.code = code;
  error.statusCode = statusCode;

  return error;
}

async function createIntervenantExitRequest({ userId, message }) {
  const existingRequest = await IntervenantExitRequest.exists({
    user: userId,
    status: "PENDING",
  });

  if (existingRequest) {
    throw createExitError(
      "Une demande est déjà en attente.",
      "INTERVENANT_EXIT_ALREADY_PENDING",
      409,
    );
  }

  return IntervenantExitRequest.create({
    user: userId,
    message,
  });
}

async function getIntervenantExitRequests(userId) {
  return IntervenantExitRequest.find({
    user: userId,
  })
    .sort({
      createdAt: -1,
    })
    .lean();
}

async function cancelIntervenantExitRequest({ userId, requestId }) {
  const request = await IntervenantExitRequest.findOne({
    _id: requestId,
    user: userId,
    status: "PENDING",
  });

  if (!request) {
    throw createExitError(
      "Cette demande n’existe pas ou ne peut plus être annulée.",
      "INTERVENANT_EXIT_NOT_CANCELLABLE",
      404,
    );
  }

  request.status = "CANCELLED";

  await request.save();

  return request;
}

async function getPendingIntervenantExitRequests() {
  return IntervenantExitRequest.find({
    status: "PENDING",
  })
    .populate("user", "firstName lastName email pseudonym role")
    .sort({
      requestedAt: 1,
    })
    .lean();
}

async function decideIntervenantExitRequest({
  requestId,
  adminId,
  decision,
  comment,
}) {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const request = await IntervenantExitRequest.findOne({
        _id: requestId,
        status: "PENDING",
      }).session(session);

      if (!request) {
        throw createExitError(
          "Cette demande n’existe pas ou a déjà été traitée.",
          "INTERVENANT_EXIT_NOT_PENDING",
          404,
        );
      }

      const user = await User.findById(request.user).session(session);

      if (
        !user ||
        user.accountStatus !== "ACTIVE" ||
        user.role !== "INTERVENANT"
      ) {
        throw createExitError(
          "Le compte associé n’est plus un compte intervenant actif.",
          "INTERVENANT_ACCOUNT_NOT_ACTIVE",
          400,
        );
      }

      const now = new Date();

      request.decidedAt = now;
      request.decidedBy = adminId;
      request.adminComment = comment;

      if (decision === "APPROVE") {
        request.status = "APPROVED";
        user.role = "MEMBER";

        await request.save({
          session,
        });

        await user.save({
          session,
        });

        await ProfessionalProfile.updateOne(
          {
            user: user._id,
          },
          {
            $set: {
              isActive: false,
              deactivatedAt: now,
            },
          },
          {
            session,
          },
        );

        await AdminActionLog.create(
          [
            {
              admin: adminId,
              targetUser: user._id,
              action: "INTERVENANT_EXIT_APPROVED",
              comment,

              previousState: {
                role: "INTERVENANT",
              },

              newState: {
                role: "MEMBER",
              },

              relatedDocument: {
                model: "IntervenantExitRequest",
                id: request._id,
              },
            },
          ],
          {
            session,
          },
        );

        return;
      }

      request.status = "DECLINED";

      await request.save({
        session,
      });

      await AdminActionLog.create(
        [
          {
            admin: adminId,
            targetUser: user._id,
            action: "INTERVENANT_EXIT_DECLINED",
            comment,

            previousState: {
              role: "INTERVENANT",
            },

            newState: {
              role: "INTERVENANT",
            },

            relatedDocument: {
              model: "IntervenantExitRequest",
              id: request._id,
            },
          },
        ],
        {
          session,
        },
      );
    });
  } finally {
    await session.endSession();
  }

  return IntervenantExitRequest.findById(requestId)
    .populate("user", "firstName lastName email pseudonym role")
    .lean();
}

module.exports = {
  createIntervenantExitRequest,
  getIntervenantExitRequests,
  cancelIntervenantExitRequest,
  getPendingIntervenantExitRequests,
  decideIntervenantExitRequest,
};
