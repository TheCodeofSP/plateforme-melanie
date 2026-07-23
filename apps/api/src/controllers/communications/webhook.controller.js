const service = require("../../services/communications/webhook.service");

module.exports = async function resendWebhook(req, res, next) {
  try {
    let payload;
    try {
      payload = service.verify(req);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Signature du webhook invalide.",
        code: "WEBHOOK_UNAUTHORIZED",
      });
    }
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Webhook non configuré.",
        code: "WEBHOOK_UNAUTHORIZED",
      });
    }
    return res.json({ success: true, result: await service.handle(payload) });
  } catch (error) {
    return next(error);
  }
};
