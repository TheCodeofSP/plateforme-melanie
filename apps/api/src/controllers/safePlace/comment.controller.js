const service = require("../../services/safePlace/comment.service");
const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (e) {
    next(e);
  }
};
module.exports = {
  list: wrap(async (req, res) =>
    res.json({
      success: true,
      comments: await service.list(req.auth.user, req.params.postId),
    }),
  ),
  create: wrap(async (req, res) =>
    res.status(201).json({
      success: true,
      comment: await service.create(
        req.auth.user,
        req.params.postId,
        req.body.content,
        null,
        req.body.signatureType,
      ),
    }),
  ),
  reply: wrap(async (req, res) => {
    const parent = await require("../../models/SafePlaceComment").findById(req.params.commentId);
    if (!parent) {
      const e = new Error("Commentaire introuvable.");
      e.statusCode = 404;
      e.code = "SAFE_PLACE_COMMENT_NOT_FOUND";
      throw e;
    }
    res.status(201).json({
      success: true,
      comment: await service.create(
        req.auth.user,
        parent.post,
        req.body.content,
        parent._id,
        req.body.signatureType,
      ),
    });
  }),
  update: wrap(async (req, res) =>
    res.json({
      success: true,
      comment: await service.update(req.auth.user, req.params.commentId, req.body.content),
    }),
  ),
  remove: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await service.remove(req.auth.user, req.params.commentId)),
    }),
  ),
  correction: wrap(async (req, res) =>
    res.json({
      success: true,
      message: "Correction transmise à Mélanie.",
      comment: await service.submitCorrection(
        req.auth.user,
        req.params.commentId,
        req.body.content,
      ),
    }),
  ),
};
