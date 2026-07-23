const express = require("express");
const authenticate = require("../../middlewares/authenticate.middleware");
const validateBody = require("../../middlewares/validate.middleware");
const validateParams = require("../../middlewares/validateParams.middleware");
const {
  forgotPassword,
  resetUserPassword,
  changeCurrentUserPassword,
} = require("../../controllers/auth");
const {
  resendActivationSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require("../../validations/auth");
const router = express.Router();

router.post(
  "/forgot-password",
  validateBody(resendActivationSchema),
  forgotPassword,
);
router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  resetUserPassword,
);
router.patch(
  "/me/password",
  authenticate,
  validateBody(changePasswordSchema),
  changeCurrentUserPassword,
);

module.exports = router;
