const createEmailVerificationTemplate = require("./emailVerification.template");
const createEmailChangeConfirmationTemplate = require("./emailChangeConfirmation.template");
const createEmailChangeSecurityTemplate = require("./emailChangeSecurity.template");
const createEmailChangeCompletedTemplate = require("./emailChangeCompleted.template");

module.exports = {
  createEmailVerificationTemplate,
  createEmailChangeConfirmationTemplate,
  createEmailChangeSecurityTemplate,
  createEmailChangeCompletedTemplate,
};
