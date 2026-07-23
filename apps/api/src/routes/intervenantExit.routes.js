const express = require("express");

const {
  createExitRequest,
  getMyExitRequests,
  cancelExitRequest,
} = require("../controllers/intervenantExit.controller");

const {
  createIntervenantExitRequestSchema,
  intervenantExitRequestIdSchema,
} = require("../validations/intervenantExit.validation");

const authenticate = require("../middlewares/authenticate.middleware");

const authorizeRoles = require("../middlewares/authorize.middleware");

const validateBody = require("../middlewares/validate.middleware");

const validateParams = require("../middlewares/validateParams.middleware");

const router = express.Router();

router.get("/me", authenticate, getMyExitRequests);

router.post(
  "/",
  authenticate,
  authorizeRoles("INTERVENANT"),
  validateBody(createIntervenantExitRequestSchema),
  createExitRequest,
);

router.delete(
  "/:requestId",
  authenticate,
  authorizeRoles("INTERVENANT"),
  validateParams(intervenantExitRequestIdSchema),
  cancelExitRequest,
);

module.exports = router;
