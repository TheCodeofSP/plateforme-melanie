const express = require("express");
const reports = require("../../controllers/safePlace/report.controller");
const mod = require("../../controllers/safePlace/moderation.controller");
const suspensions = require("../../controllers/safePlace/suspension.controller");
const authenticate = require("../../middlewares/authenticate.middleware");
const authorizeRoles = require("../../middlewares/authorize.middleware");
const validateBody = require("../../middlewares/validate.middleware");
const validateParams = require("../../middlewares/validateParams.middleware");
const validateQuery = require("../../middlewares/validateQuery.middleware");
const v = require("../../validations/safePlace.validation");
const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN"));
router.get("/moderation", validateQuery(v.moderationListSchema), reports.queue);
router.get("/reports/:reportId", validateParams(v.reportIdSchema), reports.detail);
router.post("/reports/:reportId/review", validateParams(v.reportIdSchema), reports.review);
router.post("/reports/:reportId/keep", validateParams(v.reportIdSchema), validateBody(v.adminReasonSchema), reports.keep);
router.post("/reports/:reportId/hide", validateParams(v.reportIdSchema), validateBody(v.adminReasonSchema), reports.hide);
router.post("/reports/:reportId/request-correction", validateParams(v.reportIdSchema), validateBody(v.adminReasonSchema), reports.correction);
router.post("/reports/:reportId/close-discussion", validateParams(v.reportIdSchema), validateBody(v.adminReasonSchema), reports.close);
router.post("/reports/:reportId/suspend-author", validateParams(v.reportIdSchema), validateBody(v.suspendSchema), reports.suspend);

router.post("/posts/:postId/request-correction", validateParams(v.postIdSchema), validateBody(v.adminReasonSchema), mod.requestPostCorrection);
router.post("/posts/:postId/close", validateParams(v.postIdSchema), validateBody(v.optionalReasonSchema), mod.close);
router.post("/posts/:postId/reopen", validateParams(v.postIdSchema), validateBody(v.optionalReasonSchema), mod.reopen);
router.post("/posts/:postId/pin", validateParams(v.postIdSchema), validateBody(v.optionalReasonSchema), mod.pin);
router.post("/posts/:postId/unpin", validateParams(v.postIdSchema), validateBody(v.optionalReasonSchema), mod.unpin);
router.patch("/posts/:postId/category", validateParams(v.postIdSchema), validateBody(v.moveCategorySchema), mod.move);
router.put("/posts/:postId/warning", validateParams(v.postIdSchema), validateBody(v.warningSchema), mod.warning);
router.delete("/posts/:postId/warning", validateParams(v.postIdSchema), mod.removeWarning);
router.post("/posts/:postId/hide", validateParams(v.postIdSchema), validateBody(v.adminReasonSchema), mod.hidePost);
router.post("/posts/:postId/restore", validateParams(v.postIdSchema), validateBody(v.optionalReasonSchema), mod.restorePost);
router.post("/posts/:postId/correction-decision", validateParams(v.postIdSchema), validateBody(v.correctionDecisionSchema), mod.postCorrection);
router.get("/posts/:postId/history", validateParams(v.postIdSchema), mod.postHistory);

router.post("/comments/:commentId/request-correction", validateParams(v.commentIdSchema), validateBody(v.adminReasonSchema), mod.requestCommentCorrection);
router.post("/comments/:commentId/hide", validateParams(v.commentIdSchema), validateBody(v.adminReasonSchema), mod.hideComment);
router.post("/comments/:commentId/restore", validateParams(v.commentIdSchema), validateBody(v.optionalReasonSchema), mod.restoreComment);
router.post("/comments/:commentId/correction-decision", validateParams(v.commentIdSchema), validateBody(v.correctionDecisionSchema), mod.commentCorrection);
router.get("/comments/:commentId/history", validateParams(v.commentIdSchema), mod.commentHistory);

router.get("/suspensions", validateQuery(v.suspensionListSchema), suspensions.list);
router.post("/users/:userId/suspend", validateParams(v.userIdSchema), validateBody(v.suspendSchema), suspensions.suspend);
router.post("/suspensions/:suspensionId/lift", validateParams(v.suspensionIdSchema), validateBody(v.optionalReasonSchema), suspensions.lift);
router.get("/users/:userId/history", validateParams(v.userIdSchema), suspensions.history);

module.exports = router;
