const express = require("express");

const {
  createApplication,
  updateApplication,
  submitApplication,
  getMyApplications,
  cancelApplication,
} = require("../controllers/intervenantApplication.controller");

const {
  updateIntervenantApplicationSchema,
  intervenantApplicationIdSchema,
} = require("../validations/intervenantApplication.validation");

const authenticate = require("../middlewares/authenticate.middleware");

const authorizeRoles = require("../middlewares/authorize.middleware");

const validateBody = require("../middlewares/validate.middleware");

const validateParams = require("../middlewares/validateParams.middleware");

const router = express.Router();

router.get("/me", authenticate, getMyApplications);

router.post("/", authenticate, authorizeRoles("MEMBER"), createApplication);

router.patch(
  "/:applicationId",
  authenticate,
  authorizeRoles("MEMBER"),
  validateParams(intervenantApplicationIdSchema),
  validateBody(updateIntervenantApplicationSchema),
  updateApplication,
);

router.post(
  "/:applicationId/submit",
  authenticate,
  authorizeRoles("MEMBER"),
  validateParams(intervenantApplicationIdSchema),
  submitApplication,
);

router.delete(
  "/:applicationId",
  authenticate,
  authorizeRoles("MEMBER"),
  validateParams(intervenantApplicationIdSchema),
  cancelApplication,
);

module.exports = router;
