const express = require("express");
const controller = require("../controllers/notification.controller");
const authenticate = require("../middlewares/authenticate.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validateBody = require("../middlewares/validate.middleware");
const validation = require("../validations/notification.validation");

const router = express.Router();
router.use(authenticate, authorize("ADMIN"));
router.post("/test", validateBody(validation.testSchema), controller.test);
router.post(
  "/email-preview",
  validateBody(validation.previewSchema),
  controller.preview,
);

module.exports = router;
