const service = require("../../services/safePlace/access.service");
async function charter(req, res) {
  res.json({ success: true, charter: service.charter });
}
async function access(req, res, next) {
  try {
    res.json({ success: true, access: await service.getAccess(req.auth.user) });
  } catch (e) {
    next(e);
  }
}
async function accept(req, res, next) {
  try {
    res.json({
      success: true,
      message: "La charte est acceptée.",
      consent: await service.accept(req.auth.user),
    });
  } catch (e) {
    next(e);
  }
}
async function withdraw(req, res, next) {
  try {
    res.json({
      success: true,
      message: "Ton accès au Safe Place est retiré.",
      consent: await service.withdraw(req.auth.user),
    });
  } catch (e) {
    next(e);
  }
}
module.exports = { charter, access, accept, withdraw };
