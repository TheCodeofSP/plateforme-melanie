const service = require("../../services/safePlace/media.service");
const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (e) {
    next(e);
  }
};
module.exports = {
  authorize: wrap(async (req, res) =>
    res
      .status(201)
      .json({
        success: true,
        ...(await service.authorize(req.auth.user, req.body)),
      }),
  ),
  confirm: wrap(async (req, res) =>
    res.json({
      success: true,
      media: await service.confirm(req.auth.user, req.body),
    }),
  ),
  access: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await service.access(req.auth.user, req.params.mediaId)),
    }),
  ),
  remove: wrap(async (req, res) => {
    await service.remove(req.auth.user, req.params.mediaId);
    res.json({ success: true, message: "Image supprimée." });
  }),
};
