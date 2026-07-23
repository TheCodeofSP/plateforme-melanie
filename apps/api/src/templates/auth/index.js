const createEmailVerificationTemplate = require("./emailVerification.template");
const createParentalAuthorizationTemplate = require("./parentalAuthorization.template");
const createPasswordResetTemplate = require("./passwordReset.template");
const createEmailChangeConfirmationTemplate = require("./emailChangeConfirmation.template");
const createEmailChangeSecurityTemplate = require("./emailChangeSecurity.template");

module.exports = {
  createEmailVerificationTemplate,
  createParentalAuthorizationTemplate,
  createPasswordResetTemplate,
  createEmailChangeConfirmationTemplate,
  createEmailChangeSecurityTemplate,
};
