const service = require("../../services/safePlace/moderation.service");
const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  close: wrap(async (req, res) =>
    res.json({
      success: true,
      post: await service.postAction(
        req.params.postId,
        req.auth.user,
        "CLOSE",
        req.body.reason,
      ),
    }),
  ),
  reopen: wrap(async (req, res) =>
    res.json({
      success: true,
      post: await service.postAction(
        req.params.postId,
        req.auth.user,
        "REOPEN",
        req.body.reason,
      ),
    }),
  ),
  pin: wrap(async (req, res) =>
    res.json({
      success: true,
      post: await service.postAction(
        req.params.postId,
        req.auth.user,
        "PIN",
        req.body.reason,
      ),
    }),
  ),
  unpin: wrap(async (req, res) =>
    res.json({
      success: true,
      post: await service.postAction(
        req.params.postId,
        req.auth.user,
        "UNPIN",
        req.body.reason,
      ),
    }),
  ),
  move: wrap(async (req, res) =>
    res.json({
      success: true,
      post: await service.move(
        req.params.postId,
        req.auth.user,
        req.body.categoryId,
        req.body.reason,
      ),
    }),
  ),
  warning: wrap(async (req, res) =>
    res.json({
      success: true,
      post: await service.warning(
        req.params.postId,
        req.auth.user,
        req.body.text,
      ),
    }),
  ),
  removeWarning: wrap(async (req, res) =>
    res.json({
      success: true,
      post: await service.removeWarning(req.params.postId, req.auth.user),
    }),
  ),
  hidePost: wrap(async (req, res) =>
    res.json({
      success: true,
      content: await service.hideContent(
        "POST",
        req.params.postId,
        req.auth.user,
        req.body.reason,
      ),
    }),
  ),
  restorePost: wrap(async (req, res) =>
    res.json({
      success: true,
      content: await service.restoreContent(
        "POST",
        req.params.postId,
        req.auth.user,
        req.body.reason,
      ),
    }),
  ),
  hideComment: wrap(async (req, res) =>
    res.json({
      success: true,
      content: await service.hideContent(
        "COMMENT",
        req.params.commentId,
        req.auth.user,
        req.body.reason,
      ),
    }),
  ),
  restoreComment: wrap(async (req, res) =>
    res.json({
      success: true,
      content: await service.restoreContent(
        "COMMENT",
        req.params.commentId,
        req.auth.user,
        req.body.reason,
      ),
    }),
  ),
  requestPostCorrection: wrap(async (req, res) =>
    res.json({
      success: true,
      content: await service.requestCorrection(
        "POST",
        req.params.postId,
        req.auth.user,
        req.body.reason,
      ),
    }),
  ),
  requestCommentCorrection: wrap(async (req, res) =>
    res.json({
      success: true,
      content: await service.requestCorrection(
        "COMMENT",
        req.params.commentId,
        req.auth.user,
        req.body.reason,
      ),
    }),
  ),
  postCorrection: wrap(async (req, res) =>
    res.json({
      success: true,
      content: await service.correctionDecision(
        "POST",
        req.params.postId,
        req.auth.user,
        req.body,
      ),
    }),
  ),
  commentCorrection: wrap(async (req, res) =>
    res.json({
      success: true,
      content: await service.correctionDecision(
        "COMMENT",
        req.params.commentId,
        req.auth.user,
        req.body,
      ),
    }),
  ),
  postHistory: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await service.history("POST", req.params.postId)),
    }),
  ),
  commentHistory: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await service.history("COMMENT", req.params.commentId)),
    }),
  ),
};
