const express = require("express");
const authenticate = require("../../middlewares/authenticate.middleware");
const validateBody = require("../../middlewares/validate.middleware");
const {
  requestCurrentUserEmailChange,
  confirmCurrentUserEmailChange,
} = require("../../controllers/auth");
const {
  requestEmailChangeSchema,
  tokenSchema,
} = require("../../validations/auth");
const router = express.Router();

router.post(
  "/me/email-change",
  authenticate,
  validateBody(requestEmailChangeSchema),
  requestCurrentUserEmailChange,
);
router.post(
  "/confirm-email-change",
  validateBody(tokenSchema),
  confirmCurrentUserEmailChange,
);

module.exports = router;
