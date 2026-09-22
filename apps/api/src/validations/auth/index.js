const registration = require("./registration.validation");
const activation = require("./activation.validation");
const session = require("./session.validation");
const profile = require("./profile.validation");
const emailChange = require("./emailChange.validation");
const accountDeletion = require("./accountDeletion.validation");

module.exports = {
  ...registration,
  ...activation,
  ...session,
  ...profile,
  ...emailChange,
  ...accountDeletion,
};
