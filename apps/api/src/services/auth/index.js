const registration = require("./registration.service");
const activation = require("./activation.service");
const authentication = require("./authentication.service");
const profile = require("./profile.service");
const session = require("./session.service");
const emailChange = require("./emailChange.service");
const accountDeletion = require("./accountDeletion.service");
const magicLink = require("./magicLink.service");

module.exports = {
  ...registration,
  ...activation,
  ...authentication,
  ...profile,
  ...session,
  ...emailChange,
  ...accountDeletion,
  ...magicLink,
};
