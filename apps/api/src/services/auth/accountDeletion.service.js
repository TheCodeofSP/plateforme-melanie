const User = require("../../models/User");
const { anonymizeUserById } = require("../userAnonymization.service");
const { createAuthenticationError } = require("./authErrors");

async function anonymizeUserAccount({ userId }) {
  const user = await User.findById(userId);

  if (!user) {
    throw createAuthenticationError({
      message: "Session invalide ou expirée.",
      code: "INVALID_SESSION",
      statusCode: 401,
    });
  }

  await anonymizeUserById(user._id);
}

module.exports = {
  anonymizeUserAccount,
};
