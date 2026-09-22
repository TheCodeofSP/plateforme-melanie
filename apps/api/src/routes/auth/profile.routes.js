const express = require("express");
const authenticate = require("../../middlewares/authenticate.middleware");
const validateBody = require("../../middlewares/validate.middleware");
const { updateCurrentUser } = require("../../controllers/auth");
const { updateProfileSchema } = require("../../validations/auth");
const router = express.Router();

router.patch(
  "/me",
  authenticate,
  validateBody(updateProfileSchema),
  updateCurrentUser,
);

module.exports = router;
