const service = require("../services/applicationDocument.service");
async function authorize(req, res, next) {
  try {
    res
      .status(201)
      .json({
        success: true,
        ...(await service.authorize(req.auth.user, req.body)),
      });
  } catch (e) {
    next(e);
  }
}
async function confirm(req, res, next) {
  try {
    res.json({
      success: true,
      document: await service.confirm(req.auth.user, req.body),
    });
  } catch (e) {
    next(e);
  }
}
async function access(req, res, next) {
  try {
    res.json({
      success: true,
      ...(await service.access(req.auth.user, req.params.documentId)),
    });
  } catch (e) {
    next(e);
  }
}
async function remove(req, res, next) {
  try {
    await service.remove(req.auth.user, req.params.documentId);
    res.json({ success: true, message: "Justificatif supprimé." });
  } catch (e) {
    next(e);
  }
}
module.exports = { authorize, confirm, access, remove };
