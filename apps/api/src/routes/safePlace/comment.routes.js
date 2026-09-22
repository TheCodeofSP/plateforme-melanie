const express = require("express");
const c = require("../../controllers/safePlace/comment.controller");
const r = require("../../controllers/safePlace/reaction.controller");
const authenticate = require("../../middlewares/authenticate.middleware");
const access = require("../../middlewares/safePlaceAccess.middleware");
const validateBody = require("../../middlewares/validate.middleware");
const validateParams = require("../../middlewares/validateParams.middleware");
const v = require("../../validations/safePlace.validation");
const router = express.Router();
router.use(authenticate, access);
router.post(
  "/:commentId/replies",
  validateParams(v.commentIdSchema),
  validateBody(v.commentSchema),
  c.reply,
);
router.patch(
  "/:commentId",
  validateParams(v.commentIdSchema),
  validateBody(v.commentSchema),
  c.update,
);
router.delete("/:commentId", validateParams(v.commentIdSchema), c.remove);
router.post(
  "/:commentId/correction",
  validateParams(v.commentIdSchema),
  validateBody(v.commentSchema),
  c.correction,
);
router.put(
  "/:commentId/reaction",
  validateParams(v.commentIdSchema),
  validateBody(v.reactionSchema),
  r.commentSet,
);
router.delete(
  "/:commentId/reaction",
  validateParams(v.commentIdSchema),
  r.commentRemove,
);
module.exports = router;
