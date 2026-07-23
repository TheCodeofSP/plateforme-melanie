const express = require("express");

const {
  listUsers,
  getUserDetails,
  suspendAccount,
  reactivateAccount,
  revokeIntervenant,
  anonymizeAccount,
} = require("../controllers/adminUser.controller");

const {
  adminUserIdSchema,
  adminAccountActionSchema,
  adminAnonymizeAccountSchema,
  adminUserListSchema,
} = require("../validations/adminUser.validation");

const authenticate = require("../middlewares/authenticate.middleware");

const authorizeRoles = require("../middlewares/authorize.middleware");

const validateBody = require("../middlewares/validate.middleware");

const validateParams = require("../middlewares/validateParams.middleware");
const validateQuery = require("../middlewares/validateQuery.middleware");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN"));

router.get("/", validateQuery(adminUserListSchema), listUsers);

router.get("/:userId", validateParams(adminUserIdSchema), getUserDetails);

router.post(
  "/:userId/suspend",
  validateParams(adminUserIdSchema),
  validateBody(adminAccountActionSchema),
  suspendAccount,
);

router.post(
  "/:userId/reactivate",
  validateParams(adminUserIdSchema),
  validateBody(adminAccountActionSchema),
  reactivateAccount,
);

router.post(
  "/:userId/revoke-intervenant",
  validateParams(adminUserIdSchema),
  validateBody(adminAccountActionSchema),
  revokeIntervenant,
);

router.delete(
  "/:userId",
  validateParams(adminUserIdSchema),
  validateBody(adminAnonymizeAccountSchema),
  anonymizeAccount,
);

module.exports = router;
