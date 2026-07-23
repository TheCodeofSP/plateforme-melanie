const express = require("express");

const {
  getPendingApplications,
  getApplication,
  decideApplication,
} = require("../controllers/adminIntervenantApplication.controller");

const {
  intervenantApplicationIdSchema,
  intervenantApplicationDecisionSchema,
} = require("../validations/intervenantApplication.validation");

const authenticate = require("../middlewares/authenticate.middleware");

const authorizeRoles = require("../middlewares/authorize.middleware");

const validateBody = require("../middlewares/validate.middleware");

const validateParams = require("../middlewares/validateParams.middleware");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN"));

router.get("/", getPendingApplications);

router.get(
  "/:applicationId",
  validateParams(intervenantApplicationIdSchema),
  getApplication,
);

router.post(
  "/:applicationId/decision",
  validateParams(intervenantApplicationIdSchema),
  validateBody(intervenantApplicationDecisionSchema),
  decideApplication,
);

module.exports = router;
