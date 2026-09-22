const express = require("express");
const validateBody = require("../../middlewares/validate.middleware");
const {
  verifyEmailAddress,
  resendEmailVerificationLink,
} = require("../../controllers/auth");
const {
  tokenSchema,
  resendActivationSchema,
} = require("../../validations/auth");
const router = express.Router();

router.post("/verify-email", validateBody(tokenSchema), verifyEmailAddress);
router.post(
  "/resend-email-verification",
  validateBody(resendActivationSchema),
  resendEmailVerificationLink,
);

module.exports = router;
