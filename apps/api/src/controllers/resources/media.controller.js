const media = require("../../services/resources/media.service");
const analytics = require("../../services/resources/resourceAnalytics.service");
const crypto = require("crypto");
async function authorize(req, res, next) {
  try {
    res
      .status(201)
      .json({
        success: true,
        ...(await media.authorizeUpload(req.auth.user, req.body)),
      });
  } catch (e) {
    next(e);
  }
}
async function confirm(req, res, next) {
  try {
    res.json({
      success: true,
      media: await media.confirmUpload(req.auth.user, req.body),
    });
  } catch (e) {
    next(e);
  }
}
async function access(req, res, next) {
  try {
    const download = req.query.download === "true";
    const result = await media.accessMedia(
      req.params.mediaId,
      req.auth?.user,
      download ? "attachment" : "inline",
    );
    if (download && result.resourceId) {
      let visitorId = req.cookies.resourceVisitorId;
      if (!req.auth?.user && !visitorId) {
        visitorId = crypto.randomUUID();
        res.cookie("resourceVisitorId", visitorId, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 365 * 24 * 60 * 60 * 1000,
        });
      }
      await analytics
        .recordEvent(result.resourceId, req.auth?.user, {
          type: "DOWNLOAD",
          visitorId,
        })
        .catch((error) =>
          console.error(`Téléchargement non compté: ${error.message}`),
        );
    }
    delete result.resourceId;
    res.json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
}
async function remove(req, res, next) {
  try {
    await media.deleteMedia(req.params.mediaId, req.auth.user);
    res.json({ success: true, message: "Média supprimé." });
  } catch (e) {
    next(e);
  }
}
module.exports = { authorize, confirm, access, remove };
