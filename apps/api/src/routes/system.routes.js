const express = require("express");
const controller = require("../controllers/system.controller");
const authenticate = require("../middlewares/authenticate.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validateBody = require("../middlewares/validate.middleware");
const validateQuery = require("../middlewares/validateQuery.middleware");
const validation = require("../validations/system.validation");

const router = express.Router();
router.use(authenticate, authorize("ADMIN"));
router.get("/status", controller.status);
router.post(
  "/checks",
  validateBody(validation.checksSchema),
  controller.checks,
);
router.get(
  "/email-dispatches",
  validateQuery(validation.emailDispatchListSchema),
  controller.emailDispatches,
);

module.exports = router;
