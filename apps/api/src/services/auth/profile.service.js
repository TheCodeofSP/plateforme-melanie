const User = require("../../models/User");
const { createConflictError } = require("./authErrors");

async function updateUserProfile(user, changes) {
  if (changes.pseudonym) {
    const existingUser = await User.findOne({
      _id: {
        $ne: user._id,
      },
      pseudonym: changes.pseudonym,
    })
      .collation({
        locale: "fr",
        strength: 2,
      })
      .select("_id")
      .lean();

    if (existingUser) {
      throw createConflictError("Ce pseudonyme est déjà utilisé.");
    }
  }

  if (changes.firstName !== undefined) {
    user.firstName = changes.firstName;
  }

  if (changes.lastName !== undefined) {
    user.lastName = changes.lastName;
  }

  if (changes.pseudonym !== undefined) {
    user.pseudonym = changes.pseudonym;
  }

  try {
    await user.save();
  } catch (error) {
    if (error.code === 11000) {
      throw createConflictError("Ce pseudonyme est déjà utilisé.");
    }

    throw error;
  }

  return {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    pseudonym: user.pseudonym,
    role: user.role,
    currentSpmProfile: user.currentSpmProfile,
    quizCompleted: user.quizCompleted,
  };
}

module.exports = {
  updateUserProfile,
};
