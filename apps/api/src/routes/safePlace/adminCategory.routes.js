const express = require("express");
const c = require("../../controllers/safePlace/category.controller");
const authenticate = require("../../middlewares/authenticate.middleware");
const authorizeRoles = require("../../middlewares/authorize.middleware");
const validateBody = require("../../middlewares/validate.middleware");
const validateParams = require("../../middlewares/validateParams.middleware");
const v = require("../../validations/safePlace.validation");
const router = express.Router();
router.use(authenticate, authorizeRoles("ADMIN"));
router.get("/", c.adminList);
router.post("/", validateBody(v.categoryCreateSchema), c.create);
router.patch(
  "/:categoryId",
  validateParams(v.categoryIdSchema),
  validateBody(v.categoryUpdateSchema),
  c.update,
);
router.post(
  "/:categoryId/hide",
  validateParams(v.categoryIdSchema),
  validateBody(v.optionalReasonSchema),
  c.hide,
);
router.post(
  "/:categoryId/restore",
  validateParams(v.categoryIdSchema),
  validateBody(v.optionalReasonSchema),
  c.restore,
);
router.post(
  "/:categoryId/archive",
  validateParams(v.categoryIdSchema),
  validateBody(v.optionalReasonSchema),
  c.archive,
);
router.delete("/:categoryId", validateParams(v.categoryIdSchema), c.remove);
module.exports = router;
