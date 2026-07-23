const express = require("express");
const c = require("../../controllers/safePlace/myContent.controller");
const authenticate = require("../../middlewares/authenticate.middleware");
const authorizeRoles = require("../../middlewares/authorize.middleware");
const validateParams = require("../../middlewares/validateParams.middleware");
const v = require("../../validations/safePlace.validation");
const router = express.Router();
router.use(authenticate, authorizeRoles("MEMBER"));
router.get("/", c.list);
router.delete("/posts/:postId", validateParams(v.postIdSchema), c.removePost);
router.delete(
  "/comments/:commentId",
  validateParams(v.commentIdSchema),
  c.removeComment,
);
module.exports = router;
