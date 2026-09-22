const express = require("express");
const { z } = require("zod");
const c = require("../../controllers/resources/resource.controller");
const i = require("../../controllers/resources/resourceInteraction.controller");
const a = require("../../controllers/resources/resourceAnalytics.controller");
const authenticate = require("../../middlewares/authenticate.middleware");
const optionalAuthenticate = require("../../middlewares/optionalAuthenticate.middleware");
const authorizeRoles = require("../../middlewares/authorize.middleware");
const validateBody = require("../../middlewares/validate.middleware");
const validateParams = require("../../middlewares/validateParams.middleware");
const {
  createResourceSchema,
  updateResourceSchema,
  reviewDecisionSchema,
  actionRequestSchema,
} = require("../../validations/resource.validation");
const {
  commentSchema,
  analyticsIdentitySchema,
} = require("../../validations/resourceInteraction.validation");
const actions = require("../../services/resources/resourceAction.service");

const router = express.Router();
const resourceId = z.object({ resourceId: z.string().regex(/^[a-f\d]{24}$/i) });
const commentId = z.object({
  resourceId: z.string().regex(/^[a-f\d]{24}$/i),
  commentId: z.string().regex(/^[a-f\d]{24}$/i),
});

router.get("/meta", c.meta);
router.get(
  "/mine",
  authenticate,
  authorizeRoles("ADMIN", "INTERVENANT"),
  c.mine,
);
router.get("/recommendations", authenticate, c.recommendations);
router.get("/", optionalAuthenticate, c.list);
router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "INTERVENANT"),
  validateBody(createResourceSchema),
  c.create,
);
router.get(
  "/:resourceId/related",
  optionalAuthenticate,
  validateParams(resourceId),
  c.related,
);
router.get(
  "/:resourceId/comments",
  optionalAuthenticate,
  validateParams(resourceId),
  i.comments,
);
router.post(
  "/:resourceId/comments",
  authenticate,
  validateParams(resourceId),
  validateBody(commentSchema),
  i.comment,
);
router.post(
  "/:resourceId/comments/:commentId/replies",
  authenticate,
  validateParams(commentId),
  validateBody(commentSchema),
  i.reply,
);
router.delete(
  "/:resourceId/comments/:commentId",
  authenticate,
  validateParams(commentId),
  i.remove,
);
router.post(
  "/:resourceId/like",
  authenticate,
  validateParams(resourceId),
  i.like,
);
router.delete(
  "/:resourceId/like",
  authenticate,
  validateParams(resourceId),
  i.unlike,
);
router.post(
  "/:resourceId/external-click",
  optionalAuthenticate,
  validateParams(resourceId),
  validateBody(analyticsIdentitySchema),
  a.externalClick,
);
router.get(
  "/:resourceId/stats",
  authenticate,
  authorizeRoles("ADMIN", "INTERVENANT"),
  validateParams(resourceId),
  a.stats,
);
router.get(
  "/:resourceId/history",
  authenticate,
  authorizeRoles("ADMIN", "INTERVENANT"),
  validateParams(resourceId),
  c.history,
);
router.patch(
  "/:resourceId/draft",
  authenticate,
  authorizeRoles("ADMIN", "INTERVENANT"),
  validateParams(resourceId),
  validateBody(updateResourceSchema),
  c.update,
);
router.post(
  "/:resourceId/revision",
  authenticate,
  authorizeRoles("ADMIN", "INTERVENANT"),
  validateParams(resourceId),
  c.revision,
);
router.post(
  "/:resourceId/submit",
  authenticate,
  authorizeRoles("INTERVENANT"),
  validateParams(resourceId),
  c.submit,
);
router.post(
  "/:resourceId/publish",
  authenticate,
  authorizeRoles("ADMIN"),
  validateParams(resourceId),
  validateBody(reviewDecisionSchema),
  c.publish,
);
router.post(
  "/:resourceId/action-requests",
  authenticate,
  authorizeRoles("INTERVENANT"),
  validateParams(resourceId),
  validateBody(actionRequestSchema),
  async (req, res, next) => {
    try {
      res
        .status(201)
        .json({
          success: true,
          request: await actions.createActionRequest(
            req.params.resourceId,
            req.auth.user,
            req.body,
          ),
        });
    } catch (e) {
      next(e);
    }
  },
);
router.get(
  "/:resourceId/action-requests",
  authenticate,
  authorizeRoles("INTERVENANT"),
  validateParams(resourceId),
  async (req, res, next) => {
    try {
      res.json({
        success: true,
        requests: await actions.listMyActionRequests(
          req.params.resourceId,
          req.auth.user,
        ),
      });
    } catch (e) {
      next(e);
    }
  },
);
router.get("/:slug", optionalAuthenticate, c.detail);

module.exports = router;
