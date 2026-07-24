const express = require("express");
const authenticate = require("../../middlewares/authenticate.middleware");
const validateBody = require("../../middlewares/validate.middleware");
const validateParams = require("../../middlewares/validateParams.middleware");
const { verifyEmailAddress, getParentalAuthorization, respondToParentalAuthorizationRequest, resendEmailVerificationLink, resendParentalAuthorizationLink } = require("../../controllers/auth");
const { tokenSchema, parentalAuthorizationResponseSchema, resendActivationSchema } = require("../../validations/auth");
const router = express.Router();

router.post("/verify-email", validateBody(tokenSchema), verifyEmailAddress);
router.post("/parental-authorization/details", validateBody(tokenSchema), getParentalAuthorization);
router.post("/parental-authorization/respond", validateBody(parentalAuthorizationResponseSchema), respondToParentalAuthorizationRequest);
router.post("/resend-email-verification", validateBody(resendActivationSchema), resendEmailVerificationLink);
router.post("/resend-parental-authorization", validateBody(resendActivationSchema), resendParentalAuthorizationLink);

module.exports = router;
