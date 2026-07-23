const express = require("express");
const c = require("../../controllers/safePlace/media.controller");
const authenticate = require("../../middlewares/authenticate.middleware");
const access = require("../../middlewares/safePlaceAccess.middleware");
const validateBody = require("../../middlewares/validate.middleware");
const validateParams = require("../../middlewares/validateParams.middleware");
const { mediaIdSchema } = require("../../validations/safePlace.validation");
const v = require("../../validations/safePlaceMedia.validation");
const router = express.Router();
router.use(authenticate, access);
router.post(
  "/upload-authorization",
  validateBody(v.authorizeSchema),
  c.authorize,
);
router.post("/confirm", validateBody(v.confirmSchema), c.confirm);
router.get("/:mediaId/access", validateParams(mediaIdSchema), c.access);
router.delete("/:mediaId", validateParams(mediaIdSchema), c.remove);
module.exports = router;
