const interactions = require("../../services/resources/resourceInteraction.service");
const reports = require("../../services/resources/resourceReport.service");
async function like(req, res, next) {
  try {
    res.json({
      success: true,
      ...(await interactions.toggleLike(req.params.resourceId, req.auth.user)),
    });
  } catch (e) {
    next(e);
  }
}
async function unlike(req, res, next) {
  try {
    res.json({
      success: true,
      ...(await interactions.toggleLike(
        req.params.resourceId,
        req.auth.user,
        true,
      )),
    });
  } catch (e) {
    next(e);
  }
}
async function comment(req, res, next) {
  try {
    res
      .status(201)
      .json({
        success: true,
        comment: await interactions.createComment(
          req.params.resourceId,
          req.auth.user,
          req.body.content,
        ),
      });
  } catch (e) {
    next(e);
  }
}
async function reply(req, res, next) {
  try {
    res
      .status(201)
      .json({
        success: true,
        comment: await interactions.createComment(
          req.params.resourceId,
          req.auth.user,
          req.body.content,
          req.params.commentId,
        ),
      });
  } catch (e) {
    next(e);
  }
}
async function comments(req, res, next) {
  try {
    res.json({
      success: true,
      ...(await interactions.listComments(
        req.params.resourceId,
        req.auth?.user,
      )),
    });
  } catch (e) {
    next(e);
  }
}
async function remove(req, res, next) {
  try {
    res.json({
      success: true,
      ...(await interactions.deleteOwnComment(
        req.params.commentId,
        req.auth.user,
      )),
    });
  } catch (e) {
    next(e);
  }
}
async function report(req, res, next) {
  try {
    res
      .status(201)
      .json({
        success: true,
        message: "Signalement transmis.",
        report: await reports.createReport(req.auth.user, req.body),
      });
  } catch (e) {
    next(e);
  }
}
async function listReports(req, res, next) {
  try {
    res.json({
      success: true,
      ...(await reports.listReports(req.validatedQuery)),
    });
  } catch (e) {
    next(e);
  }
}
async function resolveReport(req, res, next) {
  try {
    res.json({
      success: true,
      message: "Signalement traité.",
      report: await reports.resolveReport(
        req.params.reportId,
        req.auth.user,
        req.body,
      ),
    });
  } catch (e) {
    next(e);
  }
}
module.exports = {
  like,
  unlike,
  comment,
  reply,
  comments,
  remove,
  report,
  listReports,
  resolveReport,
};
