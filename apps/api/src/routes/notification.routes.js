const express = require("express");
const controller = require("../controllers/notification.controller");
const authenticate = require("../middlewares/authenticate.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validateBody = require("../middlewares/validate.middleware");
const validateParams = require("../middlewares/validateParams.middleware");
const validateQuery = require("../middlewares/validateQuery.middleware");
const validation = require("../validations/notification.validation");

const router = express.Router();
router.use(authenticate);

router.get("/", validateQuery(validation.listSchema), controller.list);
router.get("/unread-count", controller.unread);
router.get("/preferences", controller.preferences);
router.patch(
  "/preferences",
  validateBody(validation.preferenceSchema),
  controller.updatePreferences,
);
router.post(
  "/read-all",
  validateBody(validation.bulkSchema),
  controller.readAll,
);
router.delete(
  "/",
  validateBody(validation.bulkSchema),
  controller.removeAll,
);
router.get(
  "/:notificationId",
  validateParams(validation.notificationIdSchema),
  controller.detail,
);
router.post(
  "/:notificationId/read",
  validateParams(validation.notificationIdSchema),
  controller.read,
);
router.post(
  "/:notificationId/unread",
  validateParams(validation.notificationIdSchema),
  controller.unreadOne,
);
router.post(
  "/:notificationId/handled",
  authorize("ADMIN"),
  validateParams(validation.notificationIdSchema),
  controller.handled,
);
router.post(
  "/:notificationId/unhandled",
  authorize("ADMIN"),
  validateParams(validation.notificationIdSchema),
  controller.unhandled,
);
router.delete(
  "/:notificationId",
  validateParams(validation.notificationIdSchema),
  controller.remove,
);

module.exports = router;
