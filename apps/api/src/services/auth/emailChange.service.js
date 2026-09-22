const mongoose = require("mongoose");
const User = require("../../models/User");
const Session = require("../../models/Session");
const EmailChangeRequest = require("../../models/EmailChangeRequest");
const env = require("../../config/env");
const { generateToken, hashToken } = require("../token.service");
const { sendTransactionalEmail } = require("../email.service");
const {
  createEmailChangeConfirmationTemplate,
  createEmailChangeSecurityTemplate,
} = require("../../templates/auth");
const {
  createConflictError,
  createBadRequestError,
  createAuthenticationError,
} = require("./authErrors");
const { createNotification } = require("../notification.service");
const RESEND_COOLDOWN = 5 * 60 * 1000;
const EMAIL_CHANGE_DURATION = 24 * 60 * 60 * 1000;

async function requestEmailChange({ userId, newEmail }) {
  const user = await User.findById(userId);

  if (!user) {
    throw createAuthenticationError({
      message: "Session invalide ou expirée.",
      code: "INVALID_SESSION",
      statusCode: 401,
    });
  }

  const normalizedNewEmail = newEmail.toLowerCase();

  if (normalizedNewEmail === user.email) {
    throw createBadRequestError(
      "La nouvelle adresse doit être différente de l’adresse actuelle.",
    );
  }

  const emailAlreadyUsed = await User.exists({
    email: normalizedNewEmail,
    _id: {
      $ne: user._id,
    },
  });

  if (emailAlreadyUsed) {
    throw createConflictError("Cette adresse email est déjà utilisée.");
  }

  const latestRequest = await EmailChangeRequest.findOne({
    user: user._id,
  }).sort({
    createdAt: -1,
  });

  if (
    latestRequest &&
    Date.now() - latestRequest.createdAt.getTime() < RESEND_COOLDOWN
  ) {
    throw createBadRequestError(
      "Une demande a déjà été envoyée récemment. Réessaie dans quelques minutes.",
    );
  }

  const token = generateToken();
  const tokenHash = hashToken(token);
  const now = new Date();

  await EmailChangeRequest.updateMany(
    {
      user: user._id,
      status: "PENDING",
    },
    {
      $set: {
        status: "CANCELLED",
        cancelledAt: now,
      },
    },
  );

  await EmailChangeRequest.create({
    user: user._id,
    newEmail: normalizedNewEmail,
    tokenHash,
    expiresAt: new Date(now.getTime() + EMAIL_CHANGE_DURATION),
  });

  const confirmationTemplate = createEmailChangeConfirmationTemplate({
    firstName: user.firstName,
    token,
  });

  const securityTemplate = createEmailChangeSecurityTemplate({
    firstName: user.firstName,
    newEmail: normalizedNewEmail,
  });

  const emailResults = await Promise.allSettled([
    sendTransactionalEmail({
      emailType: "EMAIL_CHANGE_CONFIRMATION",
      recipientEmail: normalizedNewEmail,
      recipientName: user.firstName,
      ...confirmationTemplate,
    }),

    sendTransactionalEmail({
      emailType: "EMAIL_CHANGE_SECURITY_ALERT",
      recipientEmail: user.email,
      recipientName: user.firstName,
      ...securityTemplate,
    }),
  ]);

  if (env.NODE_ENV === "development" && env.EMAIL_MODE === "capture") {
    console.log("\n🔗 Lien de confirmation de la nouvelle adresse email :");
    console.log(`${env.CLIENT_URL}/confirmer-changement-email?token=${token}`);
  }

  return {
    emailsAccepted: emailResults.every(
      (result) => result.status === "fulfilled",
    ),
  };
}

async function confirmEmailChange(token) {
  const tokenHash = hashToken(token);
  const session = await mongoose.startSession();
  let confirmedUserId = null;

  try {
    await session.withTransaction(async () => {
      const request = await EmailChangeRequest.findOne({
        tokenHash,
        status: "PENDING",
      })
        .select("+tokenHash")
        .session(session);

      if (!request) {
        throw createBadRequestError(
          "Le lien de confirmation est invalide ou a déjà été utilisé.",
        );
      }

      if (request.expiresAt <= new Date()) {
        throw createBadRequestError("Le lien de confirmation a expiré.");
      }

      const user = await User.findById(request.user).session(session);

      if (!user) {
        throw createBadRequestError(
          "Le compte associé à cette demande n’existe plus.",
        );
      }

      const emailAlreadyUsed = await User.exists({
        email: request.newEmail,
        _id: {
          $ne: user._id,
        },
      }).session(session);

      if (emailAlreadyUsed) {
        throw createConflictError(
          "Cette adresse email est désormais utilisée par un autre compte.",
        );
      }

      const now = new Date();

      user.email = request.newEmail;
      user.emailVerifiedAt = now;
      confirmedUserId = user._id;

      await user.save({
        session,
      });

      request.status = "CONFIRMED";
      request.confirmedAt = now;

      await request.save({
        session,
      });

      await Session.updateMany(
        {
          user: user._id,
          revokedAt: null,
        },
        {
          $set: {
            revokedAt: now,
          },
        },
        {
          session,
        },
      );
    });
  } catch (error) {
    if (error.code === 11000) {
      throw createConflictError(
        "Cette adresse email est désormais utilisée par un autre compte.",
      );
    }

    throw error;
  } finally {
    await session.endSession();
  }

  if (confirmedUserId) {
    await createNotification({
      recipient: confirmedUserId,
      type: "ACCOUNT_SECURITY",
      title: "Adresse email modifiée",
      message: "L’adresse email de ton compte a été modifiée.",
      targetType: "USER",
      targetId: confirmedUserId,
      actionPath: "/mon-compte",
      mandatory: true,
      deduplicationKey: `email-changed:${confirmedUserId}:${Date.now()}`,
    });
  }
}

module.exports = {
  requestEmailChange,
  confirmEmailChange,
};
