const express = require("express");
const c = require("../../controllers/safePlace/adminUtility.controller");
const authenticate = require("../../middlewares/authenticate.middleware");
const authorizeRoles = require("../../middlewares/authorize.middleware");
const validateBody = require("../../middlewares/validate.middleware");
const validateQuery = require("../../middlewares/validateQuery.middleware");
const v = require("../../validations/safePlace.validation");
const router = express.Router();
router.use(authenticate, authorizeRoles("ADMIN"));
router.get("/stats", validateQuery(v.statsQuerySchema), c.stats);
router.post(
  "/notifications/broadcast",
  validateBody(v.broadcastSchema),
  c.broadcast,
);
module.exports = router;
