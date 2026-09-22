const crypto = require("crypto");
const analytics = require("../../services/resources/resourceAnalytics.service");
async function externalClick(req, res, next) {
  try {
    let visitorId = req.body.visitorId || req.cookies.resourceVisitorId;
    if (!req.auth?.user && !visitorId) {
      visitorId = crypto.randomUUID();
      res.cookie("resourceVisitorId", visitorId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
    }
    res
      .status(202)
      .json({
        success: true,
        ...(await analytics.recordEvent(req.params.resourceId, req.auth?.user, {
          type: "EXTERNAL_CLICK",
          visitorId,
        })),
      });
  } catch (e) {
    next(e);
  }
}
async function stats(req, res, next) {
  try {
    res.json({
      success: true,
      stats: await analytics.getResourceStats(
        req.params.resourceId,
        req.auth.user,
        req.query,
      ),
    });
  } catch (e) {
    next(e);
  }
}
async function overview(req, res, next) {
  try {
    res.json({
      success: true,
      resources: await analytics.getAdminOverview(req.query),
    });
  } catch (e) {
    next(e);
  }
}
module.exports = { externalClick, stats, overview };
