const service = require("../services/consent.service");
const DOCUMENT_VERSIONS = require("../config/documentVersions");
async function mine(req, res, next) {
  try {
    res.json({
      success: true,
      ...(await service.currentConsents(req.auth.user._id)),
    });
  } catch (e) {
    next(e);
  }
}
async function update(req, res, next) {
  try {
    res.json({
      success: true,
      message: "Tes préférences ont été enregistrées.",
      ...(await service.updateOptionalConsents(req.auth.user, req.body)),
    });
  } catch (e) {
    next(e);
  }
}
async function versions(req, res) {
  res.json({ success: true, versions: DOCUMENT_VERSIONS });
}
module.exports = { mine, update, versions };
