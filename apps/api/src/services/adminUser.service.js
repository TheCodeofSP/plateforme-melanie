const mongoose = require("mongoose");

const User = require("../models/User");
const Session = require("../models/Session");

const ProfessionalProfile = require("../models/ProfessionalProfile");

const IntervenantApplication = require("../models/IntervenantApplication");

const IntervenantExitRequest = require("../models/IntervenantExitRequest");

const AdminActionLog = require("../models/AdminActionLog");

const { anonymizeUserById } = require("./userAnonymization.service");

function createAdminUserError(message, code, statusCode) {
  const error = new Error(message);

  error.code = code;
  error.statusCode = statusCode;

  return error;
}

function ensureAdminIsNotTarget(adminId, userId) {
  if (adminId.toString() === userId.toString()) {
    throw createAdminUserError(
      "Tu ne peux pas effectuer cette action sur ton propre compte administrateur.",
      "ADMIN_SELF_ACTION_FORBIDDEN",
      403,
    );
  }
}

function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

async function listAdminUsers(query) {
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.accountStatus) filter.accountStatus = query.accountStatus;
  if (query.quizCompleted !== undefined) filter.quizCompleted = query.quizCompleted === "true";
  if (query.q) {
    const regex = new RegExp(escapeRegex(query.q), "i");
    filter.$or = [{ firstName: regex }, { lastName: regex }, { pseudonym: regex }, { email: regex }];
  }
  if (query.isMinor !== undefined) {
    const threshold = new Date(); threshold.setFullYear(threshold.getFullYear() - 18);
    filter.dateOfBirth = query.isMinor === "true" ? { $gt: threshold } : { $lte: threshold };
  }
  const sorts = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, lastLogin: { lastLoginAt: -1, createdAt: -1 }, name: { lastName: 1, firstName: 1 } };
  const [users, total] = await Promise.all([
    User.find(filter).select("email firstName lastName pseudonym dateOfBirth role accountStatus emailVerifiedAt currentSpmProfile quizCompleted lastLoginAt createdAt updatedAt").sort(sorts[query.sort]).skip((query.page - 1) * query.limit).limit(query.limit).lean(),
    User.countDocuments(filter),
  ]);
  return { users, pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } };
}

async function getAdminUserDetails(userId) {
  const user = await User.findById(userId).lean();

  if (!user) {
    throw createAdminUserError(
      "Ce compte n’existe pas.",
      "USER_NOT_FOUND",
      404,
    );
  }

  const [
    professionalProfile,
    intervenantApplications,
    intervenantExitRequests,
    adminActions,
  ] = await Promise.all([
    ProfessionalProfile.findOne({
      user: userId,
    }).lean(),

    IntervenantApplication.find({
      user: userId,
    })
      .sort({
        createdAt: -1,
      })
      .lean(),

    IntervenantExitRequest.find({
      user: userId,
    })
      .sort({
        createdAt: -1,
      })
      .lean(),

    AdminActionLog.find({
      targetUser: userId,
    })
      .populate("admin", "pseudonym firstName lastName")
      .sort({
        createdAt: -1,
      })
      .lean(),
  ]);

  return {
    user,
    professionalProfile,
    intervenantApplications,
    intervenantExitRequests,
    adminActions,
  };
}

async function suspendUser({ adminId, userId, comment }) {
  ensureAdminIsNotTarget(adminId, userId);

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);

      if (!user) {
        throw createAdminUserError(
          "Ce compte n’existe pas.",
          "USER_NOT_FOUND",
          404,
        );
      }

      if (user.accountStatus !== "ACTIVE") {
        throw createAdminUserError(
          "Seul un compte actif peut être suspendu.",
          "ACCOUNT_NOT_ACTIVE",
          400,
        );
      }

      const previousStatus = user.accountStatus;

      user.accountStatus = "SUSPENDED";

      await user.save({
        session,
      });

      await Session.updateMany(
        {
          user: user._id,
          revokedAt: null,
        },
        {
          $set: {
            revokedAt: new Date(),
          },
        },
        {
          session,
        },
      );

      if (user.role === "INTERVENANT") {
        await ProfessionalProfile.updateOne(
          {
            user: user._id,
          },
          {
            $set: {
              isActive: false,
              deactivatedAt: new Date(),
            },
          },
          {
            session,
          },
        );
      }

      await AdminActionLog.create(
        [
          {
            admin: adminId,
            targetUser: user._id,
            action: "ACCOUNT_SUSPENDED",
            comment,

            previousState: {
              accountStatus: previousStatus,
              role: user.role,
            },

            newState: {
              accountStatus: "SUSPENDED",
              role: user.role,
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
}

async function reactivateUser({ adminId, userId, comment }) {
  ensureAdminIsNotTarget(adminId, userId);

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);

      if (!user) {
        throw createAdminUserError(
          "Ce compte n’existe pas.",
          "USER_NOT_FOUND",
          404,
        );
      }

      if (user.accountStatus !== "SUSPENDED") {
        throw createAdminUserError(
          "Seul un compte suspendu peut être réactivé.",
          "ACCOUNT_NOT_SUSPENDED",
          400,
        );
      }

      user.accountStatus = "ACTIVE";

      await user.save({
        session,
      });

      if (user.role === "INTERVENANT") {
        await ProfessionalProfile.updateOne(
          {
            user: user._id,
          },
          {
            $set: {
              isActive: true,
              deactivatedAt: null,
            },
          },
          {
            session,
          },
        );
      }

      await AdminActionLog.create(
        [
          {
            admin: adminId,
            targetUser: user._id,
            action: "ACCOUNT_REACTIVATED",
            comment,

            previousState: {
              accountStatus: "SUSPENDED",
              role: user.role,
            },

            newState: {
              accountStatus: "ACTIVE",
              role: user.role,
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
}

async function revokeIntervenantRole({ adminId, userId, comment }) {
  ensureAdminIsNotTarget(adminId, userId);

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);

      if (!user) {
        throw createAdminUserError(
          "Ce compte n’existe pas.",
          "USER_NOT_FOUND",
          404,
        );
      }

      if (user.role !== "INTERVENANT") {
        throw createAdminUserError(
          "Ce compte n’est pas un compte intervenant.",
          "USER_NOT_INTERVENANT",
          400,
        );
      }

      user.role = "MEMBER";

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
            deactivatedAt: new Date(),
          },
        },
        {
          session,
        },
      );

      await IntervenantExitRequest.updateMany(
        {
          user: user._id,
          status: "PENDING",
        },
        {
          $set: {
            status: "CANCELLED",
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
            action: "INTERVENANT_ROLE_REVOKED",
            comment,

            previousState: {
              role: "INTERVENANT",
            },

            newState: {
              role: "MEMBER",
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
}

async function anonymizeUserAsAdmin({ adminId, userId }) {
  ensureAdminIsNotTarget(adminId, userId);

  const user = await User.findById(userId).lean();

  if (!user) {
    throw createAdminUserError(
      "Ce compte n’existe pas.",
      "USER_NOT_FOUND",
      404,
    );
  }

  await anonymizeUserById(userId);

  await AdminActionLog.create({
    admin: adminId,
    targetUser: userId,
    action: "ACCOUNT_ANONYMIZED",
    comment: null,

    previousState: {
      accountStatus: user.accountStatus,
      role: user.role,
    },

    newState: {
      accountStatus: "ANONYMIZED",
      role: "MEMBER",
    },
  });
}

module.exports = {
  listAdminUsers,
  getAdminUserDetails,
  suspendUser,
  reactivateUser,
  revokeIntervenantRole,
  anonymizeUserAsAdmin,
};
