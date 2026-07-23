const User = require("../../models/User");
const { verifyPassword } = require("../password.service");
const { anonymizeUserById } = require("../userAnonymization.service");
const { createAuthenticationError } = require("./authErrors");

async function anonymizeUserAccount({ userId, currentPassword }) {
  const user = await User.findById(userId).select("+passwordHash");

  if (!user) {
    throw createAuthenticationError({
      message: "Session invalide ou expirée.",
      code: "INVALID_SESSION",
      statusCode: 401,
    });
  }

  const passwordIsValid = await verifyPassword(
    currentPassword,
    user.passwordHash,
  );

  if (!passwordIsValid) {
    throw createAuthenticationError({
      message: "Le mot de passe actuel est incorrect.",
      code: "INVALID_CURRENT_PASSWORD",
      statusCode: 400,
    });
  }

  await anonymizeUserById(user._id);
}

module.exports = {
  anonymizeUserAccount,
};
