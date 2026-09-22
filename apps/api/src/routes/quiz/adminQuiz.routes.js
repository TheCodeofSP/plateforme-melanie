const express = require("express");
const c = require("../../controllers/quiz/adminQuiz.controller");
const authenticate = require("../../middlewares/authenticate.middleware");
const authorizeRoles = require("../../middlewares/authorize.middleware");
const validateParams = require("../../middlewares/validateParams.middleware");
const validateQuery = require("../../middlewares/validateQuery.middleware");
const v = require("../../validations/adminQuiz.validation");
const router = express.Router();
router.use(authenticate, authorizeRoles("ADMIN"));
router.get("/participants", validateQuery(v.listSchema), c.list);
router.get(
  "/participants/:participantId",
  validateParams(v.participantIdSchema),
  c.participant,
);
router.get(
  "/attempts/:attemptId",
  validateParams(v.attemptIdSchema),
  c.attempt,
);
router.get("/stats", validateQuery(v.statsSchema), c.stats);
router.post(
  "/attempts/:attemptId/retry-email",
  validateParams(v.attemptIdSchema),
  c.retryEmail,
);
router.post(
  "/participants/:participantId/retry-marketing-sync",
  validateParams(v.participantIdSchema),
  c.retryMarketingSync,
);
module.exports = router;
