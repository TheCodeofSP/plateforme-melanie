const mongoose = require("mongoose");
const User = require("../../models/User");
const Session = require("../../models/Session");
const { hashPassword, verifyPassword } = require("../password.service");
const { createAuthenticationError } = require("./authErrors");
const { createNotification } = require("../notification.service");

async function changeUserPassword({
  userId,
  currentSessionId,
  currentPassword,
  newPassword,
}) {
  const user = await User.findById(userId).select("+passwordHash");

  if (!user) {
    throw createAuthenticationError({
      message: "Session invalide ou expirée.",
      code: "INVALID_SESSION",
      statusCode: 401,
    });
  }

  const currentPasswordIsValid = await verifyPassword(
    currentPassword,
    user.passwordHash,
  );

  if (!currentPasswordIsValid) {
    throw createAuthenticationError({
      message: "Le mot de passe actuel est incorrect.",
      code: "INVALID_CURRENT_PASSWORD",
      statusCode: 400,
    });
  }

  const newPasswordHash = await hashPassword(newPassword);

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      user.passwordHash = newPasswordHash;

      await user.save({
        session,
      });

      await Session.updateMany(
        {
          user: user._id,
          _id: {
            $ne: currentSessionId,
          },
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
    });
  } finally {
    await session.endSession();
  }

  await createNotification({
    recipient: user._id,
    type: "ACCOUNT_SECURITY",
    title: "Mot de passe modifié",
    message:
      "Ton mot de passe a été modifié et les autres sessions ont été déconnectées.",
    targetType: "USER",
    targetId: user._id,
    actionPath: "/profile/security",
    mandatory: true,
    deduplicationKey: `password-changed:${user._id}:${Date.now()}`,
  });
}

module.exports = {
  changeUserPassword,
};
