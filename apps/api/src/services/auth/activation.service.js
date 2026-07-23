const mongoose = require("mongoose");
const User = require("../../models/User");
const AccountToken = require("../../models/AccountToken");
const ParentalAuthorization = require("../../models/ParentalAuthorization");
const env = require("../../config/env");
const DOCUMENT_VERSIONS = require("../../config/documentVersions");
const { calculateAge } = require("../../utils/age.utils");
const { generateToken, hashToken } = require("../token.service");
const { sendTransactionalEmail } = require("../email.service");
const {
  createEmailVerificationTemplate,
  createParentalAuthorizationTemplate,
} = require("../../templates/auth");
const { createBadRequestError } = require("./authErrors");
const { linkQuizHistoryToUser } = require("../quiz/quiz.service");
const EMAIL_VERIFICATION_DURATION = 24 * 60 * 60 * 1000;
const PARENTAL_AUTHORIZATION_DURATION = 7 * 24 * 60 * 60 * 1000;
const RESEND_COOLDOWN = 5 * 60 * 1000;

async function activateUserIfEligible(user, session) {
  if (!user.emailVerifiedAt) {
    return false;
  }

  const age = calculateAge(user.dateOfBirth);
  const isMinor = age < 18;

  if (isMinor) {
    const parentalAuthorization = await ParentalAuthorization.findOne({
      user: user._id,
      status: "APPROVED",
    }).session(session);

    if (!parentalAuthorization) {
      return false;
    }
  }

  if (user.accountStatus === "PENDING_ACTIVATION") {
    user.accountStatus = "ACTIVE";

    await user.save({
      session,
    });
  }

  return user.accountStatus === "ACTIVE";
}

async function verifyEmail(token) {
  const tokenHash = hashToken(token);
  const session = await mongoose.startSession();

  let result;
  let activatedUser = null;

  try {
    await session.withTransaction(async () => {
      const accountToken = await AccountToken.findOne({
        type: "EMAIL_VERIFICATION",
        tokenHash,
      })
        .select("+tokenHash")
        .session(session);

      if (!accountToken) {
        throw createBadRequestError(
          "Le lien de validation est invalide ou a expiré.",
        );
      }

      const user = await User.findById(accountToken.user).session(session);

      if (!user) {
        throw createBadRequestError(
          "Le compte associé à ce lien n’existe plus.",
        );
      }

      if (accountToken.usedAt) {
        if (user.accountStatus === "ACTIVE") activatedUser = user;
        result = {
          accountActivated: user.accountStatus === "ACTIVE",
          alreadyVerified: true,
        };

        return;
      }

      if (accountToken.expiresAt <= new Date()) {
        throw createBadRequestError("Le lien de validation a expiré.");
      }

      const now = new Date();

      if (!user.emailVerifiedAt) {
        user.emailVerifiedAt = now;

        await user.save({
          session,
        });
      }

      accountToken.usedAt = now;

      await accountToken.save({
        session,
      });

      const accountActivated = await activateUserIfEligible(user, session);

      if (accountActivated) activatedUser = user;

      result = {
        accountActivated,
        alreadyVerified: false,
      };
    });
  } finally {
    await session.endSession();
  }

  if (activatedUser) await linkQuizHistoryToUser(activatedUser);

  return result;
}

async function getParentalAuthorizationDetails(token) {
  const tokenHash = hashToken(token);

  const authorization = await ParentalAuthorization.findOne({
    tokenHash,
  }).select("+tokenHash");

  if (!authorization) {
    throw createBadRequestError("Le lien d’autorisation est invalide.");
  }

  if (
    authorization.status === "PENDING" &&
    authorization.expiresAt <= new Date()
  ) {
    authorization.status = "EXPIRED";

    await authorization.save();
  }

  const user = await User.findById(authorization.user).select("firstName");

  if (!user) {
    throw createBadRequestError(
      "Le compte associé à cette demande n’existe plus.",
    );
  }

  return {
    minorFirstName: user.firstName,
    documentVersion: authorization.documentVersion,
    expiresAt: authorization.expiresAt,
    status: authorization.status,
  };
}

async function respondToParentalAuthorization(token, decision) {
  const tokenHash = hashToken(token);
  const session = await mongoose.startSession();

  let result;
  let activatedUser = null;

  try {
    await session.withTransaction(async () => {
      const authorization = await ParentalAuthorization.findOne({
        tokenHash,
      })
        .select("+tokenHash")
        .session(session);

      if (!authorization) {
        throw createBadRequestError("Le lien d’autorisation est invalide.");
      }

      const user = await User.findById(authorization.user).session(session);

      if (!user) {
        throw createBadRequestError(
          "Le compte associé à cette demande n’existe plus.",
        );
      }

      if (
        authorization.status === "APPROVED" ||
        authorization.status === "DECLINED"
      ) {
        if (
          authorization.status === "APPROVED" &&
          user.accountStatus === "ACTIVE"
        )
          activatedUser = user;
        result = {
          status: authorization.status,
          accountActivated: user.accountStatus === "ACTIVE",
          alreadyAnswered: true,
          expired: false,
        };

        return;
      }

      if (
        authorization.status === "EXPIRED" ||
        authorization.expiresAt <= new Date()
      ) {
        authorization.status = "EXPIRED";

        await authorization.save({
          session,
        });

        result = {
          status: "EXPIRED",
          accountActivated: false,
          alreadyAnswered: false,
          expired: true,
        };

        return;
      }

      if (authorization.status === "REVOKED") {
        throw createBadRequestError("Cette autorisation a été révoquée.");
      }

      const now = new Date();

      if (decision === "APPROVE") {
        authorization.status = "APPROVED";
        authorization.approvedAt = now;

        await authorization.save({
          session,
        });

        const accountActivated = await activateUserIfEligible(user, session);

        if (accountActivated) activatedUser = user;

        result = {
          status: "APPROVED",
          accountActivated,
          alreadyAnswered: false,
          expired: false,
        };

        return;
      }

      authorization.status = "DECLINED";
      authorization.declinedAt = now;

      await authorization.save({
        session,
      });

      result = {
        status: "DECLINED",
        accountActivated: false,
        alreadyAnswered: false,
        expired: false,
      };
    });
  } finally {
    await session.endSession();
  }

  if (activatedUser) await linkQuizHistoryToUser(activatedUser);

  if (result.expired) {
    throw createBadRequestError("Le lien d’autorisation a expiré.");
  }

  return result;
}

async function resendEmailVerification(email) {
  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (
    !user ||
    user.accountStatus !== "PENDING_ACTIVATION" ||
    user.emailVerifiedAt
  ) {
    return {
      emailAccepted: false,
    };
  }

  const latestToken = await AccountToken.findOne({
    user: user._id,
    type: "EMAIL_VERIFICATION",
  }).sort({
    createdAt: -1,
  });

  if (
    latestToken &&
    Date.now() - latestToken.createdAt.getTime() < RESEND_COOLDOWN
  ) {
    return {
      emailAccepted: false,
    };
  }

  const token = generateToken();
  const tokenHash = hashToken(token);
  const now = new Date();

  await AccountToken.updateMany(
    {
      user: user._id,
      type: "EMAIL_VERIFICATION",
      usedAt: null,
    },
    {
      $set: {
        usedAt: now,
      },
    },
  );

  await AccountToken.create({
    user: user._id,
    type: "EMAIL_VERIFICATION",
    tokenHash,
    expiresAt: new Date(now.getTime() + EMAIL_VERIFICATION_DURATION),
  });

  const template = createEmailVerificationTemplate({
    firstName: user.firstName,
    token,
  });

  try {
    await sendTransactionalEmail({
      emailType: "ACCOUNT_ACTIVATION",
      recipientEmail: user.email,
      recipientName: user.firstName,
      ...template,
    });

    if (env.NODE_ENV === "development" && env.EMAIL_MODE === "capture") {
      console.log("\n🔗 Nouveau lien de validation email :");
      console.log(`${env.CLIENT_URL}/verify-email?token=${token}`);
    }

    return {
      emailAccepted: true,
    };
  } catch (error) {
    console.error(
      "❌ Échec du renvoi de l’email de validation :",
      error.message,
    );

    return {
      emailAccepted: false,
    };
  }
}

async function resendParentalAuthorization(email) {
  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user || user.accountStatus !== "PENDING_ACTIVATION") {
    return {
      emailAccepted: false,
    };
  }

  const age = calculateAge(user.dateOfBirth);

  if (age < 15 || age >= 18) {
    return {
      emailAccepted: false,
    };
  }

  const latestAuthorization = await ParentalAuthorization.findOne({
    user: user._id,
  }).sort({
    createdAt: -1,
  });

  if (
    !latestAuthorization ||
    latestAuthorization.status === "APPROVED" ||
    latestAuthorization.status === "DECLINED"
  ) {
    return {
      emailAccepted: false,
    };
  }

  if (Date.now() - latestAuthorization.sentAt.getTime() < RESEND_COOLDOWN) {
    return {
      emailAccepted: false,
    };
  }

  const token = generateToken();
  const tokenHash = hashToken(token);
  const now = new Date();

  await ParentalAuthorization.updateMany(
    {
      user: user._id,
      status: "PENDING",
    },
    {
      $set: {
        status: "REVOKED",
        revokedAt: now,
      },
    },
  );

  await ParentalAuthorization.create({
    user: user._id,
    guardianEmail: latestAuthorization.guardianEmail,
    tokenHash,
    documentVersion: DOCUMENT_VERSIONS.PARENTAL_AUTHORIZATION,
    sentAt: now,
    expiresAt: new Date(now.getTime() + PARENTAL_AUTHORIZATION_DURATION),
  });

  const template = createParentalAuthorizationTemplate({
    minorFirstName: user.firstName,
    token,
  });

  try {
    await sendTransactionalEmail({
      emailType: "PARENTAL_AUTHORIZATION",
      recipientEmail: latestAuthorization.guardianEmail,
      recipientName: "Responsable légal",
      ...template,
    });

    if (env.NODE_ENV === "development" && env.EMAIL_MODE === "capture") {
      console.log("\n🔗 Nouveau lien d’autorisation parentale :");
      console.log(`${env.CLIENT_URL}/parental-authorization?token=${token}`);
    }

    return {
      emailAccepted: true,
    };
  } catch (error) {
    console.error(
      "❌ Échec du renvoi de l’autorisation parentale :",
      error.message,
    );

    return {
      emailAccepted: false,
    };
  }
}

module.exports = {
  activateUserIfEligible,
  verifyEmail,
  getParentalAuthorizationDetails,
  respondToParentalAuthorization,
  resendEmailVerification,
  resendParentalAuthorization,
};
