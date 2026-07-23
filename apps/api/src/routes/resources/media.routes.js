const express = require("express");
const { z } = require("zod");
const c = require("../../controllers/resources/media.controller");
const authenticate = require("../../middlewares/authenticate.middleware");
const optionalAuthenticate = require("../../middlewares/optionalAuthenticate.middleware");
const authorizeRoles = require("../../middlewares/authorize.middleware");
const validateBody = require("../../middlewares/validate.middleware");
const validateParams = require("../../middlewares/validateParams.middleware");
const {
  uploadAuthorizationSchema,
  confirmMediaSchema,
} = require("../../validations/media.validation");
const router = express.Router();
router.post(
  "/upload-authorization",
  authenticate,
  authorizeRoles("ADMIN", "INTERVENANT"),
  validateBody(uploadAuthorizationSchema),
  c.authorize,
);
router.post(
  "/confirm",
  authenticate,
  authorizeRoles("ADMIN", "INTERVENANT"),
  validateBody(confirmMediaSchema),
  c.confirm,
);
router.get(
  "/:mediaId/access",
  optionalAuthenticate,
  validateParams(z.object({ mediaId: z.string().regex(/^[a-f\d]{24}$/i) })),
  c.access,
);
router.delete(
  "/:mediaId",
  authenticate,
  authorizeRoles("ADMIN", "INTERVENANT"),
  validateParams(z.object({ mediaId: z.string().regex(/^[a-f\d]{24}$/i) })),
  c.remove,
);
module.exports = router;
