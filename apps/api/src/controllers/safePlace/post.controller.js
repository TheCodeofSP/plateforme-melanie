const service = require("../../services/safePlace/post.service");
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
      ...(await service.list(req.auth.user, req.validatedQuery)),
    }),
  ),
  detail: wrap(async (req, res) =>
    res.json({
      success: true,
      post: await service.detail(req.auth.user, req.params.postId),
    }),
  ),
  create: wrap(async (req, res) =>
    res
      .status(201)
      .json({
        success: true,
        post: await service.create(req.auth.user, req.body),
      }),
  ),
  update: wrap(async (req, res) =>
    res.json({
      success: true,
      post: await service.update(req.auth.user, req.params.postId, req.body),
    }),
  ),
  remove: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await service.remove(req.auth.user, req.params.postId)),
    }),
  ),
  correction: wrap(async (req, res) =>
    res.json({
      success: true,
      message: "Correction transmise à Mélanie.",
      post: await service.submitCorrection(
        req.auth.user,
        req.params.postId,
        req.body,
      ),
    }),
  ),
};
