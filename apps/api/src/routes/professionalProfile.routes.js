const express = require("express");
const c = require("../controllers/professionalProfile.controller");
const authenticate = require("../middlewares/authenticate.middleware");
const authorizeRoles = require("../middlewares/authorize.middleware");
const validateBody = require("../middlewares/validate.middleware");
const validateParams = require("../middlewares/validateParams.middleware");
const v = require("../validations/professionalProfile.validation");
const router = express.Router();
router.get("/me", authenticate, authorizeRoles("INTERVENANT"), c.mine);
router.patch(
  "/me/draft",
  authenticate,
  authorizeRoles("INTERVENANT"),
  validateBody(v.profileVersionSchema),
  c.update,
);
router.post(
  "/me/submit",
  authenticate,
  authorizeRoles("INTERVENANT"),
  validateBody(v.submitProfileSchema),
  c.submit,
);
router.post(
  "/me/revision",
  authenticate,
  authorizeRoles("INTERVENANT"),
  c.revision,
);
module.exports = router;
