const express = require("express");
const authenticate = require("../../middlewares/authenticate.middleware");
const validateBody = require("../../middlewares/validate.middleware");
const { deleteCurrentUserAccount } = require("../../controllers/auth");
const { deleteAccountSchema } = require("../../validations/auth");
const router = express.Router();

router.delete(
  "/me",
  authenticate,
  validateBody(deleteAccountSchema),
  deleteCurrentUserAccount,
);

module.exports = router;
