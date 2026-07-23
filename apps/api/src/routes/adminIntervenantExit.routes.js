const express = require("express");

const {
  getPendingExitRequests,
  decideExitRequest,
} = require("../controllers/intervenantExit.controller");

const {
  intervenantExitDecisionSchema,
  intervenantExitRequestIdSchema,
} = require("../validations/intervenantExit.validation");

const authenticate = require("../middlewares/authenticate.middleware");

const authorizeRoles = require("../middlewares/authorize.middleware");

const validateBody = require("../middlewares/validate.middleware");

const validateParams = require("../middlewares/validateParams.middleware");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN"));

router.get("/", getPendingExitRequests);

router.post(
  "/:requestId/decision",
  validateParams(intervenantExitRequestIdSchema),
  validateBody(intervenantExitDecisionSchema),
  decideExitRequest,
);

module.exports = router;
