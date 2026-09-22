const registration = require("./registration.controller");
const activation = require("./activation.controller");
const session = require("./session.controller");
const profile = require("./profile.controller");
const emailChange = require("./emailChange.controller");
const accountDeletion = require("./accountDeletion.controller");

module.exports = {
  ...registration,
  ...activation,
  ...session,
  ...profile,
  ...emailChange,
  ...accountDeletion,
};
