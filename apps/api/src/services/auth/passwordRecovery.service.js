const mongoose = require("mongoose");
const User = require("../../models/User");
const AccountToken = require("../../models/AccountToken");
const Session = require("../../models/Session");
const env = require("../../config/env");
const { hashPassword } = require("../password.service");
const { generateToken, hashToken } = require("../token.service");
const { sendTransactionalEmail } = require("../email.service");
const { createPasswordResetTemplate } = require("../../templates/auth");
const { createBadRequestError } = require("./authErrors");
const RESEND_COOLDOWN = 5 * 60 * 1000;
const PASSWORD_RESET_DURATION = 60 * 60 * 1000;

async function requestPasswordReset(email) {
  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user || user.accountStatus === "ANONYMIZED") {
    return {
      emailAccepted: false,
    };
  }

  const latestToken = await AccountToken.findOne({
    user: user._id,
    type: "PASSWORD_RESET",
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
      type: "PASSWORD_RESET",
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
    type: "PASSWORD_RESET",
    tokenHash,
    expiresAt: new Date(now.getTime() + PASSWORD_RESET_DURATION),
  });

  const template = createPasswordResetTemplate({
    firstName: user.firstName,
    token,
  });

  try {
    await sendTransactionalEmail({
      emailType: "PASSWORD_RECOVERY",
      recipientEmail: user.email,
      recipientName: user.firstName,
      ...template,
    });

    if (env.NODE_ENV === "development" && env.EMAIL_MODE === "capture") {
      console.log("\n🔗 Lien de réinitialisation du mot de passe :");
      console.log(`${env.CLIENT_URL}/reset-password?token=${token}`);
    }

    return {
      emailAccepted: true,
    };
  } catch (error) {
    console.error(
      "❌ Échec de l’envoi du lien de réinitialisation :",
      error.message,
    );

    return {
      emailAccepted: false,
    };
  }
}

async function resetPassword({ token, password }) {
  const tokenHash = hashToken(token);
  const passwordHash = await hashPassword(password);
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const accountToken = await AccountToken.findOne({
        type: "PASSWORD_RESET",
        tokenHash,
      })
        .select("+tokenHash")
        .session(session);

      if (!accountToken || accountToken.usedAt) {
        throw createBadRequestError(
          "Le lien de réinitialisation est invalide ou a déjà été utilisé.",
        );
      }

      if (accountToken.expiresAt <= new Date()) {
        throw createBadRequestError("Le lien de réinitialisation a expiré.");
      }

      const user = await User.findById(accountToken.user)
        .select("+passwordHash")
        .session(session);

      if (!user || user.accountStatus === "ANONYMIZED") {
        throw createBadRequestError(
          "Le compte associé à ce lien n’existe plus.",
        );
      }

      const now = new Date();

      user.passwordHash = passwordHash;

      await user.save({
        session,
      });

      accountToken.usedAt = now;

      await accountToken.save({
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
  } finally {
    await session.endSession();
  }
}

module.exports = {
  requestPasswordReset,
  resetPassword,
};
